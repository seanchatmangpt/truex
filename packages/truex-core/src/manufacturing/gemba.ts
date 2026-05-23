import { TruexHook } from "../hook.js";
import { TruexContext } from "../context.js";
import type { GraphDelta, Receipt, HookEvent, HookEffect } from "../runtime-law.js";
// @ts-ignore - Importing from root src which is outside of the package's local TS scope
import { OcelCollector } from "../../../../src/ocel2/index.js";

/**
 * GembaEvidence represents the 'Evidence' (OCEL 2.0 traces) 
 * that matches the physical execution (hook execution) to the digital twin.
 */
export interface GembaEvidence {
  hookId: string;
  deltaId: string;
  timestamp: string;
  diagnostics: {
    inputHash: string;
    outputHash: string;
    receiptHash: string;
    effects: HookEffect[];
    events: HookEvent[];
  };
  ocelTrace: any;
}

/**
 * GembaMonitor (Genchi Genbutsu - Go and See).
 * 
 * In the Toyota Production System, Genchi Genbutsu means going to the source 
 * to find the facts to make correct decisions, build consensus and achieve goals.
 * 
 * The GembaMonitor implements this by witnessing the 'Transformation' of a hook
 * and capturing exhaustive OCEL 2.0 evidence of the state transition.
 */
export class GembaMonitor {
  private collector: any;

  constructor() {
    this.collector = new OcelCollector();
  }

  /**
   * Genchi Genbutsu: Witness the actual transformation at the Gemba.
   * 
   * Provides deep-link diagnostics into the exact state of a hook 
   * at the moment of 'Transformation'.
   * 
   * @param ctx The Truex context
   * @param hook The hook being executed
   * @param delta The input delta causing the transformation
   * @param previousReceiptHash The previous link in the hash chain
   */
  async witness(
    ctx: TruexContext,
    hook: TruexHook,
    delta: GraphDelta,
    previousReceiptHash: string | null
  ): Promise<GembaEvidence> {
    const timestamp = new Date().toISOString();
    
    // The 'Gemba' is the simulation of the hook execution
    // where we capture the OCEL 2.0 traces.
    const result = await this.collector.simulate(
      {
        activity: 'Transformation',
        actor: 'GembaMonitor',
        timestamp,
        attributes: {
          hookId: hook.definition.id,
          hookName: hook.definition.name,
          deltaId: delta.id,
          system: 'Truex Manufacturing'
        },
        // In OCEL 2.0, we associate the event with objects.
        // Here we associate it with the Hook and the Delta.
        objects: [
          { id: hook.definition.id, type: 'Hook', qualifier: 'processor' },
          { id: delta.id, type: 'Delta', qualifier: 'input' }
        ]
      },
      () => {
        return hook.execute(ctx, delta, previousReceiptHash);
      }
    );

    if (!result.trajectory.valid) {
      throw new Error(`Gemba Transformation failed: ${result.trajectory.result}`);
    }

    const { effects, receipt, events } = result.trajectory.result as {
      effects: HookEffect[];
      receipt: Receipt;
      events: HookEvent[];
    };

    // Settle the trace as "Evidence" (matches physical execution to digital twin)
    result.settle();

    return {
      hookId: hook.definition.id,
      deltaId: delta.id,
      timestamp,
      diagnostics: {
        inputHash: receipt.inputHash,
        outputHash: receipt.outputHash,
        receiptHash: receipt.receiptHash,
        effects,
        events
      },
      ocelTrace: result.speculativeOcel
    };
  }

  /**
   * Export the gathered evidence as an OCEL 2.0 envelope.
   */
  exportEvidence() {
    return this.collector.exportEnvelope('gemba-trace', 'transformation-span');
  }
}
