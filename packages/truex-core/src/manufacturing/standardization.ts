import type { HookDefinition } from "../runtime-law.js";

/**
 * WorkStandards: Standardized Work for Truex Manufacturing.
 * Based on Toyota Production System (TPS) principles.
 *
 * Standardized work is the foundation of quality and continuous improvement.
 * It ensures that every 'Reflex' (Hook) manufactured is deterministic,
 * efficient, and re-executable.
 */
export const WorkStandards = {
  /**
   * Takt Time: The canonical heart-beat for hook execution.
   * In Truex, it defines the maximum allowed duration for a hook to execute
   * while maintaining the system's operational flow.
   *
   * @constant {number} TAKT_TIME - Target duration in milliseconds.
   */
  TAKT_TIME: 50,

  /**
   * Reflex Patterns: Structural blueprints for deterministic hooks.
   * These patterns ensure that hooks are 'Manufacturable'—meaning they can be
   * reliably re-executed (replayed) with identical results.
   */
  ReflexPatterns: {
    /**
     * Standard Work Sequence for Hook Definition.
     * Every hook must follow this sequence of structural checks.
     */
    Sequence: [
      "Identity Verification",
      "Trigger Specification",
      "Effect Atomicity",
      "Determinism Check",
    ] as const,

    /**
     * Enforces the 'Reflex Pattern' on a Hook Definition.
     * Ensures the hook is 'Manufacturable' (deterministically re-executable).
     *
     * @param {HookDefinition} definition - The hook definition to standardize.
     * @throws {Error} If the definition violates standardization rules.
     */
    enforce(definition: HookDefinition): void {
      // 1. Identity Verification (Jidoka - Autonomation)
      // Quality must be built into the manufacturing process.
      if (!definition.id || typeof definition.id !== "string") {
        throw new Error("Standardization Failure (Jidoka): Hook lacks a valid ID.");
      }
      if (!definition.name || typeof definition.name !== "string") {
        throw new Error("Standardization Failure (Jidoka): Hook lacks a valid Name.");
      }

      // 2. Trigger Specification (Standardized Work)
      if (!definition.condition || !definition.condition.kind) {
        throw new Error(
          "Standardization Failure: Hook lacks a deterministic trigger (condition)."
        );
      }

      // 3. Effect Atomicity (Muda - Waste Elimination)
      // A hook with no effects is 'Muda' (waste of processing).
      if (!Array.isArray(definition.effects) || definition.effects.length === 0) {
        throw new Error(
          "Standardization Failure (Muda): Hook produces no effects (over-processing waste)."
        );
      }

      // 4. Determinism Check (Heijunka - Leveling)
      // Ensuring output is predictable and leveled.
      const validKinds = new Set(["emit-event", "add-quad"]);
      for (const effect of definition.effects) {
        if (!validKinds.has(effect.kind)) {
          throw new Error(
            `Standardization Failure: Effect kind '${effect.kind}' is non-standard/non-deterministic.`
          );
        }
      }

      // 5. Capacity Check (Muri - Overburden)
      // Hooks with too many effects cause system overburden.
      if (definition.effects.length > WorkStandards.STANDARD_IN_PROCESS_STOCK) {
        throw new Error(
          `Standardization Failure (Muri): Hook produces too many effects (${definition.effects.length} > ${WorkStandards.STANDARD_IN_PROCESS_STOCK}).`
        );
      }
    },

    /**
     * Checks if a hook definition is 'Manufacturable'.
     *
     * @param {HookDefinition} definition - The hook definition to check.
     * @returns {boolean} True if the hook meets all standards.
     */
    isManufacturable(definition: HookDefinition): boolean {
      try {
        this.enforce(definition);
        return true;
      } catch {
        return false;
      }
    },
  },

  /**
   * Standard In-Process Stock:
   * Defines the maximum number of effects a single hook should produce
   * to remain manageable and avoid 'overproduction' waste.
   */
  STANDARD_IN_PROCESS_STOCK: 10,
};

/**
 * Validates that a hook execution adheres to the Takt Time standard.
 *
 * @param {number} duration - The measured execution time in milliseconds.
 * @returns {boolean} True if the execution was within Takt Time.
 */
export function validateTaktTime(duration: number): boolean {
  return duration <= WorkStandards.TAKT_TIME;
}

/**
 * Wraps a HookDefinition to ensure it is standardized before use.
 *
 * @param {HookDefinition} definition - The raw hook definition.
 * @returns {HookDefinition} The standardized hook definition.
 */
export function standardize(definition: HookDefinition): HookDefinition {
  WorkStandards.ReflexPatterns.enforce(definition);
  return definition;
}
