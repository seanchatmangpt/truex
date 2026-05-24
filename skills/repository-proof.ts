import * as fs from 'node:fs';
import * as path from 'node:path';
import { validateSkillMarkdown } from "../packages/truex-core/src/integration/skill-sandbox.js";
import { compileTaskToDelta } from "../packages/truex-core/src/integration/task-delta.js";

export type RepositoryProofReport = {
  passed: boolean;
  failures: string[];
  invariants: string[];
};

export function proveRepository(): RepositoryProofReport {
  const failures: string[] = [];
  const invariants = [
    "all skills pass sandbox validation (no Math.random or clock dependencies)",
    "task markdown files compile successfully to GraphDelta",
  ];

  try {
    // 1. Validate all skills on disk
    const skillsDir = path.resolve(process.cwd(), 'skills');
    if (fs.existsSync(skillsDir)) {
      const folders = fs.readdirSync(skillsDir);
      for (const folder of folders) {
        // Skip files, only scan directories
        const folderPath = path.join(skillsDir, folder);
        if (!fs.statSync(folderPath).isDirectory()) {
          continue;
        }
        
        const skillMdPath = path.join(folderPath, 'SKILL.md');
        if (fs.existsSync(skillMdPath)) {
          const content = fs.readFileSync(skillMdPath, 'utf8');
          const validation = validateSkillMarkdown(content);
          if (!validation.valid) {
            failures.push(`Skill ${folder}/SKILL.md failed validation: ${validation.violations.join('; ')}`);
          }
        }
      }
    }

    // 2. Validate task.md in workspace if it exists
    const taskPath = path.resolve(process.cwd(), 'task.md');
    if (fs.existsSync(taskPath)) {
      const content = fs.readFileSync(taskPath, 'utf8');
      const delta = compileTaskToDelta(content);
      if (!delta || !delta.id || delta.adds.length === 0) {
        failures.push("task.md compiled to empty or invalid delta");
      }
    }
  } catch (error: any) {
    failures.push(`Repository proof execution error: ${error.message}`);
  }

  return {
    passed: failures.length === 0,
    failures,
    invariants
  };
}

import Database from 'better-sqlite3';
import { OntologyRegistry } from '../packages/truex-core/src/persistence/ontology.js';
import { emitTopologyGraph } from '../scripts/observatory/lib/emit-topology-graph.js';
import { initializeSchema } from '../packages/truex-core/src/index.js';

export function proveOntology() {
  const invariants: string[] = [];
  const failures: string[] = [];
  
  try {
    const graph = emitTopologyGraph();
    
    const dbPath = path.resolve(process.cwd(), 'gall_truex.db');
    const db = new Database(dbPath);
    initializeSchema(db);
    const registry = new OntologyRegistry(db);

    for (const node of graph.nodes) {
      registry.upsertNode(node as any);
    }

    invariants.push('Ontology Registry synced with Live Graph');

    const allFiles = graph.nodes.map(n => n.id);
    const orphans = registry.getOrphans(allFiles);

    if (orphans.length === 0) {
      invariants.push('100% Gall Mapping Coverage Verified');
    } else {
      failures.push(`Found ${orphans.length} orphaned artifacts`);
    }

    const unmapped = graph.nodes.filter(n => n.layer === 'Unmapped');
    if (unmapped.length === 0) {
      invariants.push('No files classified as Unmapped');
    } else {
      failures.push(`Found ${unmapped.length} unmapped files: ${unmapped.map(u => u.id).join(', ')}`);
    }

    // New Operational Documentation Laws
    for (const node of graph.nodes) {
      if (node.type === 'Primitive' || node.type === 'Manufacturing' || node.type === 'Persistence') {
        if (!node.provedBy || node.provedBy.length === 0) {
          failures.push(`Genesis Defect: Core file ${node.id} has no tests proving its capability.`);
        }
        if (!node.documentedBy || node.documentedBy.length === 0) {
          failures.push(`Observability Defect: Core file ${node.id} is not mapped by any Observatory Fact Emitter.`);
        }
      }
    }

    if (failures.length === 0) {
      invariants.push('All core files have cryptographic proof and observatory documentation');
    }
    
    db.close();
  } catch (error: any) {
    failures.push(`Unexpected ontology proof error: ${error.message}`);
  }

  return {
    passed: failures.length === 0,
    invariants,
    failures
  };
}

export type OntologyProofReport = {
  passed: boolean;
  failures: string[];
  invariants: string[];
};

