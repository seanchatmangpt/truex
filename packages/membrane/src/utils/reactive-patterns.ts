/**
 * @module reactive-patterns
 * @description Centralized loader for all 34 Vernon-based reactive patterns,
 * providing standard wrappers to run them sequentially or concurrently.
 */

export const patternMap: Record<string, () => Promise<{ run: () => Promise<void> }>> = {
  "aggregator": () => import("../../../../examples/reactive/aggregator.js"),
  "claim-check": () => import("../../../../examples/reactive/claim-check.js"),
  "competing-consumer": () => import("../../../../examples/reactive/competing-consumer.js"),
  "content-based-router": () => import("../../../../examples/reactive/content-based-router.js"),
  "content-enricher": () => import("../../../../examples/reactive/content-enricher.js"),
  "content-filter": () => import("../../../../examples/reactive/content-filter.js"),
  "datatype-channel": () => import("../../../../examples/reactive/datatype-channel.js"),
  "domain-model-prototype": () => import("../../../../examples/reactive/domain-model-prototype.js"),
  "dynamic-router": () => import("../../../../examples/reactive/dynamic-router.js"),
  "envelope-wrapper": () => import("../../../../examples/reactive/envelope-wrapper.js"),
  "guaranteed-delivery": () => import("../../../../examples/reactive/guaranteed-delivery.js"),
  "idempotent-receiver": () => import("../../../../examples/reactive/idempotent-receiver.js"),
  "message-bus": () => import("../../../../examples/reactive/message-bus.js"),
  "message-expiration": () => import("../../../../examples/reactive/message-expiration.js"),
  "message-filter": () => import("../../../../examples/reactive/message-filter.js"),
  "message-metadata": () => import("../../../../examples/reactive/message-metadata.js"),
  "message-router": () => import("../../../../examples/reactive/message-router.js"),
  "messaging-bridge": () => import("../../../../examples/reactive/messaging-bridge.js"),
  "pipes-and-filters": () => import("../../../../examples/reactive/pipes-and-filters.js"),
  "point-to-point-channel": () => import("../../../../examples/reactive/point-to-point-channel.js"),
  "polling-consumer": () => import("../../../../examples/reactive/polling-consumer.js"),
  "process-manager": () => import("../../../../examples/reactive/process-manager.js"),
  "publish-subscribe": () => import("../../../../examples/reactive/publish-subscribe.js"),
  "recipient-list": () => import("../../../../examples/reactive/recipient-list.js"),
  "request-reply": () => import("../../../../examples/reactive/request-reply.js"),
  "resequencer": () => import("../../../../examples/reactive/resequencer.js"),
  "return-address": () => import("../../../../examples/reactive/return-address.js"),
  "routing-slip": () => import("../../../../examples/reactive/routing-slip.js"),
  "scatter-gather": () => import("../../../../examples/reactive/scatter-gather.js"),
  "selective-consumer": () => import("../../../../examples/reactive/selective-consumer.js"),
  "smart-proxy": () => import("../../../../examples/reactive/smart-proxy.js"),
  "splitter": () => import("../../../../examples/reactive/splitter.js"),
  "transactional-actor": () => import("../../../../examples/reactive/transactional-actor.js"),
  "wire-tap": () => import("../../../../examples/reactive/wire-tap.js")
};

export const patternNames = Object.keys(patternMap);

/**
 * Retrieve the list of all 34 reactive pattern names.
 */
export function getReactivePatternNames(): string[] {
  return [...patternNames];
}

/**
 * Executes a single reactive pattern by name.
 */
export async function runReactivePattern(name: string): Promise<void> {
  const loader = patternMap[name];
  if (!loader) {
    throw new Error(`Unknown reactive pattern: ${name}`);
  }
  const mod = await loader();
  await mod.run();
}

/**
 * Executes all 34 reactive patterns sequentially.
 */
export async function runAllReactivePatterns(): Promise<{ name: string; success: boolean; error?: string }[]> {
  const results: { name: string; success: boolean; error?: string }[] = [];
  for (const name of patternNames) {
    try {
      await runReactivePattern(name);
      results.push({ name, success: true });
    } catch (err: any) {
      results.push({ name, success: false, error: err.message || String(err) });
    }
  }
  return results;
}
