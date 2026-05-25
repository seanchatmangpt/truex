import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { WorkStandards, standardize, validateTaktTime } from "../src/manufacturing/standardization.js";
import { hookDefinitionArbitrary } from "./utils/arbitraries.js";

describe("WorkStandards (Standardized Work) - Property Tests", () => {
  describe("Takt Time", () => {
    it("should have a canonical Takt Time of 50ms", () => {
      expect(WorkStandards.TAKT_TIME).toBe(50);
    });

    it("should validate durations against Takt Time", () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 100 }), (duration) => {
          const isValid = validateTaktTime(duration);
          if (duration <= 50) {
            expect(isValid).toBe(true);
          } else {
            expect(isValid).toBe(false);
          }
        })
      );
    });
  });

  describe("Reflex Patterns (Standardization)", () => {
    it("∀ valid hook definition, standardize should not throw", () => {
      fc.assert(
        fc.property(hookDefinitionArbitrary, (hook) => {
          expect(() => standardize(hook)).not.toThrow();
        })
      );
    });

    it("should throw on missing ID", () => {
      fc.assert(
        fc.property(hookDefinitionArbitrary, (hook) => {
          const invalid = { ...hook, id: "" };
          expect(() => standardize(invalid)).toThrow("Standardization Failure (Jidoka): Hook lacks a valid ID.");
        })
      );
    });

    it("should throw on missing Name", () => {
      fc.assert(
        fc.property(hookDefinitionArbitrary, (hook) => {
          const invalid = { ...hook, name: "" };
          expect(() => standardize(invalid)).toThrow("Standardization Failure (Jidoka): Hook lacks a valid Name.");
        })
      );
    });

    it("should throw on Muda (empty effects)", () => {
      fc.assert(
        fc.property(hookDefinitionArbitrary, (hook) => {
          const invalid = { ...hook, effects: [] };
          expect(() => standardize(invalid)).toThrow("Standardization Failure (Muda): Hook produces no effects (over-processing waste).");
        })
      );
    });

    it("should throw on Muri (overburden - too many effects)", () => {
      fc.assert(
        fc.property(
          hookDefinitionArbitrary,
          fc.array(fc.record({ kind: fc.constant('emit-event' as const), type: fc.string() }), { minLength: 11, maxLength: 20 }),
          (hook, extraEffects) => {
            const invalid = { ...hook, effects: extraEffects };
            expect(() => standardize(invalid)).toThrow(/Standardization Failure \(Muri\): Hook produces too many effects/);
          }
        )
      );
    });
  });
});
