import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RepositoryLaws } from '../../../packages/truex-core/src/manufacturing/registry.js';
import { WorkStandards } from '../../../packages/truex-core/src/manufacturing/standardization.js';
import { FactEmitter, EmitterMetadata } from './fact-emitter.js';

/**
 * @module emit-manufacturing-facts
 * @description
 * Gall Classification: Observatory Pillar (Manufacturing extraction)
 * Purpose: Extracts architectural facts about the Truex manufacturing process,
 * based on the Toyota Production System (TPS) principles. Validates the 
 * Repository Laws and records operational invariants.
 */
export class ManufacturingFactsEmitter extends FactEmitter {
  getMetadata(): EmitterMetadata {
    return {
      name: 'Manufacturing Facts Emitter',
      description: 'Extracts architectural facts about the manufacturing pillars and repository laws',
      outputPath: 'docs/v1/latest/facts/manufacturing.json'
    };
  }

  protected collectFacts() {
    return {
      pillars: {
        jit: {
          active: true,
          name: "Just-In-Time (JIT)",
          description: "Pull-based signaling system (Kanban) that eliminates over-processing waste (Muda).",
          components: ["KanbanSystem"],
          mechanism: "Hooks are only pulled for execution when a delta matching their signaling condition enters the line."
        },
        jidoka: {
          active: true,
          name: "Jidoka (Autonomation)",
          description: "Quality at the source via error-proofing (Poka-yoke) and failure signaling (Andon).",
          components: ["AndonSystem", "PokaYoke"],
          mechanism: "Immediately stops the production line (Line Stop) when an abnormal condition or law violation is detected."
        },
        heijunka: {
          active: true,
          name: "Heijunka (Leveling)",
          description: "Levels the production volume and mix to prevent overburden (Muri) and unevenness (Mura).",
          components: ["ProductionScheduler"],
          mechanism: "Batches and intervals hook execution to maintain a steady flow and respect system capacity."
        },
        kaizen: {
          active: true,
          name: "Kaizen (Continuous Improvement)",
          description: "The 'Refining Engine' that analyzes execution history to suggest optimizations.",
          components: ["RefiningEngine", "GembaInspector"],
          mechanism: "Analyzes receipts to identify redundant hooks and suggests tighter predicates for JIT efficiency."
        }
      },
      workStandards: {
        taktTime: `${WorkStandards.TAKT_TIME}ms`,
        standardInProcessStock: WorkStandards.STANDARD_IN_PROCESS_STOCK,
        sequence: WorkStandards.ReflexPatterns.Sequence
      },
      repositoryLaws: RepositoryLaws.map(law => ({
        id: law.id,
        name: law.name,
        condition: this.describeCondition(law.condition),
        effects: law.effects.map(e => this.describeEffect(e))
      })),
      otherComponents: {
        standardization: ["WorkStandards"],
        gemba: ["GembaMonitor"],
        collaboration: ["PeerReview"],
        lean: ["WasteDetector"],
        orchestration: ["ProductionLine"]
      },
      files: [
        "packages/truex-core/src/manufacturing/jit.ts",
        "packages/truex-core/src/manufacturing/jidoka.ts",
        "packages/truex-core/src/manufacturing/heijunka.ts",
        "packages/truex-core/src/manufacturing/kaizen.ts",
        "packages/truex-core/src/manufacturing/standardization.ts",
        "packages/truex-core/src/manufacturing/gemba.ts",
        "packages/truex-core/src/manufacturing/collaboration.ts",
        "packages/truex-core/src/manufacturing/lean.ts",
        "packages/truex-core/src/manufacturing/line.ts",
        "packages/truex-core/src/manufacturing/registry.ts"
      ]
    };
  }

  private describeCondition(condition: any): any {
    switch (condition.kind) {
      case 'always': {
        return {
          kind: 'always',
          description: 'Unconditional enforcement for all operations entering the production line.'
        };
      }
      case 'delta-match': {
        return {
          kind: 'delta-match',
          predicate: condition.predicate,
          description: `Triggered when the GraphDelta contains quads matching the predicate: ${condition.predicate}`
        };
      }
      default: {
        return condition;
      }
    }
  }

  private describeEffect(effect: any): any {
    switch (effect.kind) {
      case 'emit-event': {
        return {
          kind: 'emit-event',
          type: effect.type,
          description: `Emits a '${effect.type}' event for downstream processing (e.g., receipt generation).`
        };
      }
      case 'add-quad': {
        return {
          kind: 'add-quad',
          quad: effect.quad,
          description: 'Adds an architectural quad to the graph as a side-effect of law enforcement.'
        };
      }
      default: {
        return effect;
      }
    }
  }
}

/**
 * Legacy export for backward compatibility. Instantiates the ManufacturingFactsEmitter
 * and executes the fact extraction process.
 * @returns A promise that resolves to the emitted facts object.
 */
export async function emitManufacturingFacts() {
  const emitter = new ManufacturingFactsEmitter();
  return emitter.emit();
}

// Self-execute if run as a script
const isMain = process.argv[1] && (
  process.argv[1].endsWith('emit-manufacturing-facts.ts') || 
  process.argv[1].endsWith('emit-manufacturing-facts.js') ||
  process.argv[1] === fileURLToPath(import.meta.url)
);

if (isMain) {
  emitManufacturingFacts();
}
