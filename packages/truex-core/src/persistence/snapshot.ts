/**
 * @module snapshot
 * @description Manages state snapshots and delta application for the quad-graph.
 * Gall Classification: S1 (replay primitives).
 * Ensures deterministic state reconstruction.
 */
import type { Quad, GraphDelta } from "../runtime-law.js";
import type { TruexContext } from "../context.js";
import { hash } from "../hash.js";

/**
 * A StateSnapshot represents the full state of the quad-graph at a specific
 * point in the execution history, identified by a receipt hash.
 */
export interface StateSnapshot {
  /**
   * The receipt hash of the last operation included in this snapshot.
   */
  receiptHash: string;

  /**
   * The full set of quads representing the graph state.
   */
  quads: Quad[];

  /**
   * Timestamp of when the snapshot was created.
   */
  timestamp: number;

  /**
   * Optional metadata for the snapshot.
   */
  metadata?: Record<string, any>;
}

/**
 * Compares two quads for equality.
 */
export function quadEquals(a: Quad, b: Quad): boolean {
  return (
    a.subject === b.subject &&
    a.predicate === b.predicate &&
    a.object === b.object &&
    (a.graph ?? null) === (b.graph ?? null)
  );
}

/**
 * StateManager handles the evolution of the quad-graph state.
 * It provides utilities for applying deltas and managing snapshots.
 */
export const SnapshotManager = {
  /**
   * Creates a new snapshot from the current state and receipt hash.
   */
  create(quads: Quad[], receiptHash: string, metadata?: Record<string, any>, ctx?: TruexContext): StateSnapshot {
    return {
      receiptHash,
      quads: quads.map(q => ({ ...q })), // Deep copy quads
      timestamp: ctx ? ctx.clock() : Date.now(),
      metadata,
    };
  },

  /**
   * Applies a GraphDelta to a set of quads.
   * 
   * @param quads The current set of quads (the state).
   * @param delta The delta to apply.
   * @param emittedQuads Additional quads emitted by hooks during execution of the delta.
   * @returns A new set of quads representing the updated state.
   */
  applyDelta(
    quads: Quad[],
    delta: GraphDelta,
    emittedQuads: Quad[] = []
  ): Quad[] {
    let nextState = [...quads];

    // 1. Remove deleted quads
    if (delta.deletes.length > 0) {
      nextState = nextState.filter(
        (existing) => !delta.deletes.some((toDelete) => quadEquals(existing, toDelete))
      );
    }

    // 2. Add new quads from the delta
    for (const q of delta.adds) {
      if (!nextState.some((existing) => quadEquals(existing, q))) {
        nextState.push({ ...q });
      }
    }

    // 3. Add emitted quads from hooks
    for (const q of emittedQuads) {
      if (!nextState.some((existing) => quadEquals(existing, q))) {
        nextState.push({ ...q });
      }
    }

    return nextState;
  },

  /**
   * Computes a deterministic hash for a set of quads.
   * This can be used to verify state integrity.
   */
  hashState(quads: Quad[]): string {
    // Sort quads to ensure deterministic hashing
    const sortedQuads = [...quads].sort((a, b) => {
      const sa = `${a.subject}|${a.predicate}|${a.object}|${a.graph ?? ""}`;
      const sb = `${b.subject}|${b.predicate}|${b.object}|${b.graph ?? ""}`;
      return sa.localeCompare(sb);
    });
    return hash(sortedQuads);
  },

  /**
   * Replays a series of deltas on top of an initial state (snapshot).
   * 
   * @param baseSnapshot The starting snapshot.
   * @param history A sequence of deltas and their corresponding emitted quads.
   * @returns The final set of quads after replaying all deltas.
   */
  replay(
    baseSnapshot: StateSnapshot,
    history: { delta: GraphDelta; emittedQuads?: Quad[] }[]
  ): Quad[] {
    let currentState = [...baseSnapshot.quads];

    for (const entry of history) {
      currentState = this.applyDelta(currentState, entry.delta, entry.emittedQuads);
    }

    return currentState;
  },
};
