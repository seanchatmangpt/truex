/**
 * @module hook-interceptor
 * @description Intercepts agent actions against hook conditions and invariants.
 * Gall Classification: S2 (engine primitives).
 */
import type { HookDefinition } from "../runtime-law.js";

/**
 * Intercepts an agent action, runs it against the conditions of the registered hooks,
 * and denies/refuses the action if it violates an invariant.
 *
 * Invariants include:
 * - Attempting to run a forbidden command prefix (for run_command).
 * - Writing to a prototype Symbol or prototype properties (for write_file).
 *
 * @param action The agent action to check.
 * @param hooks The list of registered hook definitions.
 */
export function interceptAgyExecution(
  action: {
    type: "run_command" | "write_file";
    target: string;
    value?: string;
  },
  hooks: HookDefinition[],
): { allowed: boolean; reason?: string } {
  if (!action || typeof action !== "object") {
    return { allowed: false, reason: "Invalid action object" };
  }

  if (action.type !== "run_command" && action.type !== "write_file") {
    return {
      allowed: false,
      reason: `Unsupported action type: ${(action as any).type}`,
    };
  }

  if (typeof action.target !== "string") {
    return { allowed: false, reason: "Action target must be a string" };
  }

  // 1. Find all hooks matching this action's type
  const matchedHooks = hooks.filter((hook) => {
    if (!hook || !hook.condition) return false;
    if (hook.condition.kind === "always") return true;
    if (hook.condition.kind === "delta-match") {
      return hook.condition.predicate === action.type;
    }
    return false;
  });

  // 2. Evaluate matched hooks for invariants
  for (const hook of matchedHooks) {
    const effects = hook.effects || [];

    for (const effect of effects) {
      // Handle 'emit-event' invariants
      if (effect.kind === "emit-event" && typeof effect.type === "string") {
        const eventType = effect.type;

        // Command prefix checking
        if (
          action.type === "run_command" &&
          eventType.startsWith("deny-prefix:")
        ) {
          const prefix = eventType.slice("deny-prefix:".length);
          if (action.target.startsWith(prefix)) {
            return {
              allowed: false,
              reason: `Action violates invariant: command starts with forbidden prefix '${prefix}' (Hook: ${hook.name})`,
            };
          }
        }
        if (
          action.type === "run_command" &&
          eventType.startsWith("forbidden-prefix:")
        ) {
          const prefix = eventType.slice("forbidden-prefix:".length);
          if (action.target.startsWith(prefix)) {
            return {
              allowed: false,
              reason: `Action violates invariant: command starts with forbidden prefix '${prefix}' (Hook: ${hook.name})`,
            };
          }
        }

        // Prototype / Symbol pollution checking
        if (
          action.type === "write_file" &&
          (eventType === "deny-prototype" ||
            eventType === "deny:prototype" ||
            eventType === "deny-symbol" ||
            eventType === "deny:symbol" ||
            eventType === "prevent-prototype-pollution")
        ) {
          const isProtoOrSymbol =
            /__proto__|prototype|constructor|Symbol/i.test(action.target);
          if (isProtoOrSymbol) {
            return {
              allowed: false,
              reason: `Action violates invariant: writing to prototype or Symbol is forbidden (Hook: ${hook.name})`,
            };
          }
          if (
            action.value &&
            /__proto__|prototype|constructor|Symbol/i.test(action.value)
          ) {
            return {
              allowed: false,
              reason: `Action violates invariant: value contains forbidden prototype or Symbol reference (Hook: ${hook.name})`,
            };
          }
        }
      }

      // Handle 'add-quad' invariants
      if (effect.kind === "add-quad" && effect.quad) {
        const { subject, predicate, object } = effect.quad;

        // Command prefix check
        if (
          action.type === "run_command" &&
          subject === "forbidden-prefix" &&
          predicate === "run_command" &&
          typeof object === "string" &&
          action.target.startsWith(object)
        ) {
          return {
            allowed: false,
            reason: `Action violates invariant: command starts with forbidden prefix '${object}' (Hook: ${hook.name})`,
          };
        }

        // Forbidden pattern check
        if (
          subject === "forbidden-pattern" &&
          predicate === action.type &&
          typeof object === "string"
        ) {
          if (action.target.includes(object)) {
            return {
              allowed: false,
              reason: `Action violates invariant: target contains forbidden pattern '${object}' (Hook: ${hook.name})`,
            };
          }
          if (action.value && action.value.includes(object)) {
            return {
              allowed: false,
              reason: `Action violates invariant: value contains forbidden pattern '${object}' (Hook: ${hook.name})`,
            };
          }
        }

        // Prototype symbol check via quad definition
        if (
          action.type === "write_file" &&
          subject === "deny" &&
          predicate === "prototype" &&
          /__proto__|prototype|constructor|Symbol/i.test(action.target)
        ) {
          return {
            allowed: false,
            reason: `Action violates invariant: writing to prototype or Symbol is forbidden (Hook: ${hook.name})`,
          };
        }
      }
    }

    // Heuristics based on Hook Name
    const nameLower = (hook.name || "").toLowerCase();

    // Sudo or administrative command blocking heuristics
    if (
      action.type === "run_command" &&
      (nameLower.includes("prevent-sudo") ||
        nameLower.includes("deny-sudo") ||
        nameLower.includes("no-sudo") ||
        nameLower.includes("forbidden-sudo")) &&
      action.target.startsWith("sudo")
    ) {
      return {
        allowed: false,
        reason: `Action violates invariant: command starts with forbidden prefix 'sudo' (Hook: ${hook.name})`,
      };
    }

    // Prototype pollution / Symbol heuristics
    if (
      action.type === "write_file" &&
      (nameLower.includes("prototype") ||
        nameLower.includes("pollution") ||
        nameLower.includes("symbol")) &&
      /__proto__|prototype|constructor|Symbol/i.test(action.target)
    ) {
      return {
        allowed: false,
        reason: `Action violates invariant: writing to prototype or Symbol is forbidden (Hook: ${hook.name})`,
      };
    }
  }

  return { allowed: true };
}
