import { OcelCollector, createOcelProxy } from "../../skills/membrane/mutations.js";
import { createDeterministicContext } from "../../packages/truex-core/src/context.js";

export type IngestionResult = {
  envelope: any;
  isValid: boolean;
};

export class TelcoAgent {
  /**
   * Ingests a state transition mutation and yields a verified OCEL receipt envelope.
   */
  ingestTransition(
    activityName: string,
    actorName: string,
    targetState: { balance: number },
    newBalance: number
  ): IngestionResult {
    // Inject deterministic context to avoid timing/entropy leaks during ingestion
    const ctx = createDeterministicContext(999);
    const collector = new OcelCollector(ctx);

    const proxy = createOcelProxy(targetState, { id: "obj_1", type: "Account" }, collector);

    collector.event(
      {
        activity: activityName,
        actor: actorName,
        objects: [{ id: "obj_1", qualifier: "account_modified" }],
      },
      () => {
        proxy.balance = newBalance;
      }
    );

    const envelope = collector.exportEnvelope("trace_999", "span_123");
    const isValid = OcelCollector.verifyEnvelope(envelope);

    return {
      envelope,
      isValid,
    };
  }
}
