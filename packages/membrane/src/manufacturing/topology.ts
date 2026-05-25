/**
 * @module manufacturing/topology
 * @description Gall S₂: Engine primitives.
 * Implements RecursiveHookEngine to orchestrate hook cascading.
 */
import type { GraphDelta, Receipt, HookEffect, HookEvent, Quad } from '../runtime-law.js';
import type { TruexContext } from '../context.js';
import { TruexHook } from '../hook.js';
import { createReceipt } from '../receipt.js';
import { hash } from '../hash.js';

export class TopologyRefusalError extends Error {
  constructor(public override message: string, public receipt: Receipt, public topology?: HookTopology) {
    super(message);
    this.name = 'TopologyRefusalError';
  }
}

/**
 * HookActivation: Represents a single execution of a hook in the causal graph.
 */
export interface HookActivation {
  id: string;
  hookId: string;
  triggerDeltaId: string;
  depth: number;
  receipt: Receipt;
  producedDeltaId?: string; // The ID of the GraphDelta produced by this activation
}

/**
 * HookTopology: Tracks the causal graph of hook activations for a single root delta.
 */
export interface HookTopology {
  rootDeltaId: string;
  activations: HookActivation[];
  maxDepth: number;
}

/**
 * RecursiveHookEngine: Orchestrates the execution of hooks and their cascading effects.
 */
export class RecursiveHookEngine {
  private readonly maxDepth: number;
  private readonly maxEmittedDeltas: number;
  private readonly refuseOnBreach: boolean;
  private readonly maxFanout?: number;

  constructor(
    private readonly context: TruexContext,
    private readonly options: { maxDepth?: number; maxEmittedDeltas?: number; refuseOnBreach?: boolean; maxFanout?: number } = {}
  ) {
    this.maxDepth = options.maxDepth ?? 10;
    this.maxEmittedDeltas = options.maxEmittedDeltas ?? 50;
    this.refuseOnBreach = options.refuseOnBreach ?? false;
    this.maxFanout = options.maxFanout;
  }

  /**
   * Processes a GraphDelta and its cascading effects.
   * 
   * @param rootDelta The initial delta that starts the cascade.
   * @param pullHooks A function to pull hooks matching a given delta.
   * @param execute A function to execute a hook with a given delta.
   * @returns A HookTopology representing the entire causal graph.
   */
  async process(
    rootDelta: GraphDelta,
    pullHooks: (delta: GraphDelta) => TruexHook[],
    execute: (hook: TruexHook, delta: GraphDelta, previousReceiptHash?: string) => {
      receipt: Receipt;
      effects: HookEffect[];
      events: HookEvent[];
    }
  ): Promise<HookTopology> {
    const topology: HookTopology = {
      rootDeltaId: rootDelta.id,
      activations: [],
      maxDepth: this.maxDepth,
    };

    const state = { totalEmittedDeltas: 0 };
    await this.cascade(rootDelta, 0, null, pullHooks, execute, topology, [], state);

    return topology;
  }

  /**
   * Internal recursive function to handle cascading deltas.
   */
  private async cascade(
    delta: GraphDelta,
    depth: number,
    parentReceiptHash: string | null,
    pullHooks: (delta: GraphDelta) => TruexHook[],
    execute: (hook: TruexHook, delta: GraphDelta, previousReceiptHash?: string) => {
      receipt: Receipt;
      effects: HookEffect[];
      events: HookEvent[];
    },
    topology: HookTopology,
    ancestors: { hookId: string; activationId: string; receiptHash: string }[],
    state: { totalEmittedDeltas: number }
  ): Promise<void> {
    if (depth >= this.maxDepth) {
      if (this.refuseOnBreach) {
        // Prevent Hook Storms/Infinite Cycles (Depth Breach)
        const refuseReceipt = createReceipt(
          this.context,
          `evt_refused_${this.context.uuid()}`,
          delta.id,
          hash(delta),
          hash({ reason: 'Max depth breach' }),
          parentReceiptHash,
          'refused',
          undefined,
          { reason: `Max depth breach: depth ${depth} >= ${this.maxDepth}` }
        );
        
        const activation: HookActivation = {
          id: this.context.uuid(),
          hookId: 'depth-breach-refusal',
          triggerDeltaId: delta.id,
          depth,
          receipt: refuseReceipt,
        };
        topology.activations.push(activation);
        throw new TopologyRefusalError(`Max depth breach: depth ${depth} >= ${this.maxDepth}`, refuseReceipt, topology);
      } else {
        // Silent stop (old behavior)
        return;
      }
    }

    const hooks = pullHooks(delta);
    
    if (this.refuseOnBreach && this.maxFanout !== undefined && hooks.length > this.maxFanout) {
      const refuseReceipt = createReceipt(
        this.context,
        `evt_refused_${this.context.uuid()}`,
        delta.id,
        hash(delta),
        hash({ reason: 'Max fanout breach' }),
        parentReceiptHash,
        'refused',
        undefined,
        { reason: `Max fanout breach: ${hooks.length} > ${this.maxFanout}` }
      );
      
      const activation: HookActivation = {
        id: this.context.uuid(),
        hookId: 'fanout-breach-refusal',
        triggerDeltaId: delta.id,
        depth,
        receipt: refuseReceipt,
      };
      topology.activations.push(activation);
      throw new TopologyRefusalError(`Max fanout breach: ${hooks.length} > ${this.maxFanout}`, refuseReceipt, topology);
    }

    for (const hook of hooks) {
      if (this.refuseOnBreach) {
        // Cyclic A -> B -> A hook storm is detected
        const cycleAncestor = ancestors.find(a => a.hookId === hook.definition.id);
        if (cycleAncestor) {
          const refuseReceipt = createReceipt(
            this.context,
            `evt_refused_${this.context.uuid()}`,
            delta.id,
            hash(delta),
            hash({ reason: 'Cyclic hook storm detected' }),
            parentReceiptHash,
            'refused',
            undefined,
            { reason: `Cyclic hook storm detected: Hook ${hook.definition.id} is already in the execution path` }
          );

          const activation: HookActivation = {
            id: this.context.uuid(),
            hookId: hook.definition.id,
            triggerDeltaId: delta.id,
            depth,
            receipt: refuseReceipt,
          };
          topology.activations.push(activation);
          throw new TopologyRefusalError(`Cyclic hook storm detected: Hook ${hook.definition.id} is already in the execution path`, refuseReceipt, topology);
        }
      }

      // Execute the hook
      let receipt: Receipt;
      let effects: HookEffect[];
      const activationId = this.context.uuid();

      try {
        const result = execute(hook, delta, parentReceiptHash ?? undefined);
        receipt = result.receipt;
        effects = result.effects;
      } catch (error_: any) {
        if (this.refuseOnBreach) {
          // Create a refused receipt for this failed hook
          receipt = createReceipt(
            this.context,
            `evt_refused_${this.context.uuid()}`,
            delta.id,
            hash(delta),
            hash({ error: error_.message }),
            parentReceiptHash,
            'refused',
            undefined,
            { reason: `Execution failure: ${error_.message}` }
          );

          const activation: HookActivation = {
            id: activationId,
            hookId: hook.definition.id,
            triggerDeltaId: delta.id,
            depth,
            receipt,
          };
          topology.activations.push(activation);

          // Perform cascade-rollback for all ancestors in the current path in reverse order
          let lastFailedReceipt = receipt;
          for (let i = ancestors.length - 1; i >= 0; i--) {
            const ancestor = ancestors[i];
            const rollbackReceipt = createReceipt(
              this.context,
              `evt_rollback_${this.context.uuid()}`,
              delta.id,
              ancestor.receiptHash,
              hash({ rolledBack: true }),
              lastFailedReceipt.receiptHash,
              'refused',
              undefined,
              {
                rollbackOf: ancestor.activationId,
                failedChildId: lastFailedReceipt.id,
                reason: `Rollback triggered by failure of child: ${error_.message}`
              }
            );

            topology.activations.push({
              id: this.context.uuid(),
              hookId: ancestor.hookId,
              triggerDeltaId: delta.id,
              depth: i,
              receipt: rollbackReceipt,
            });
            lastFailedReceipt = rollbackReceipt;
          }

          throw new TopologyRefusalError(`Hook ${hook.definition.id} failed: ${error_.message}`, receipt, topology);
        } else {
          // Silent re-throw (old behavior)
          throw error_;
        }
      }

      const activation: HookActivation = {
        id: activationId,
        hookId: hook.definition.id,
        triggerDeltaId: delta.id,
        depth,
        receipt,
      };

      topology.activations.push(activation);

      // Extract add-quad effects to form a new GraphDelta
      const adds = effects
        .filter((e): e is { kind: 'add-quad'; quad: Quad } => e.kind === 'add-quad')
        .map(e => e.quad);

      if (adds.length > 0) {
        state.totalEmittedDeltas += 1;
        if (this.refuseOnBreach && state.totalEmittedDeltas > this.maxEmittedDeltas) {
          const refuseReceipt = createReceipt(
            this.context,
            `evt_refused_${this.context.uuid()}`,
            delta.id,
            hash(delta),
            hash({ reason: 'Max emitted-delta count breach' }),
            receipt.receiptHash,
            'refused',
            undefined,
            { reason: `Max emitted-delta count breach: ${state.totalEmittedDeltas} > ${this.maxEmittedDeltas}` }
          );

          const errActivation: HookActivation = {
            id: this.context.uuid(),
            hookId: 'delta-breach-refusal',
            triggerDeltaId: delta.id,
            depth: depth + 1,
            receipt: refuseReceipt,
          };
          topology.activations.push(errActivation);
          
          // Clean up/Rollback current activation and ancestors
          let lastFailedReceipt = refuseReceipt;
          const allAncestors = [...ancestors, { hookId: hook.definition.id, activationId, receiptHash: receipt.receiptHash }];
          for (let i = allAncestors.length - 1; i >= 0; i--) {
            const ancestor = allAncestors[i];
            const rollbackReceipt = createReceipt(
              this.context,
              `evt_rollback_${this.context.uuid()}`,
              delta.id,
              ancestor.receiptHash,
              hash({ rolledBack: true }),
              lastFailedReceipt.receiptHash,
              'refused',
              undefined,
              {
                rollbackOf: ancestor.activationId,
                failedChildId: lastFailedReceipt.id,
                reason: `Rollback triggered by max emitted-delta count breach`
              }
            );

            topology.activations.push({
              id: this.context.uuid(),
              hookId: ancestor.hookId,
              triggerDeltaId: delta.id,
              depth: i,
              receipt: rollbackReceipt,
            });
            lastFailedReceipt = rollbackReceipt;
          }

          throw new TopologyRefusalError(`Max emitted-delta count breach: ${state.totalEmittedDeltas} > ${this.maxEmittedDeltas}`, refuseReceipt, topology);
        }

        const nextDelta: GraphDelta = {
          id: this.context.uuid(),
          adds,
          deletes: [],
        };

        activation.producedDeltaId = nextDelta.id;

        // Recurse: Downstream hooks are triggered by the new delta
        // We chain the receipt hash to maintain the causal proof chain
        await this.cascade(
          nextDelta,
          depth + 1,
          receipt.receiptHash,
          pullHooks,
          execute,
          topology,
          [...ancestors, { hookId: hook.definition.id, activationId, receiptHash: receipt.receiptHash }],
          state
        );
      }
    }
  }
}
