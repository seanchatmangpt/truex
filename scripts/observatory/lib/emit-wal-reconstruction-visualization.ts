import { fileURLToPath } from 'node:url';
import { FactEmitter, EmitterMetadata } from './fact-emitter.js';

const VISUALIZATION_PATH = 'docs/v1/latest/diagrams/wal-reconstruction-visualization.md';

export class WalReconstructionVisualizationEmitter extends FactEmitter {
  getMetadata(): EmitterMetadata {
    return {
      name: 'WAL Reconstruction Visualization Emitter',
      description: 'Generates a text/markdown visualization of the WAL reconstruction and verification chain',
      outputPath: VISUALIZATION_PATH
    };
  }

  protected collectFacts() {
    return `
# S7 WAL Reconstruction & Verification Chain Visualization

This document provides a conceptual ASCII and flowchart representation of how the Truex Membrane loads, reorders, validates, and projects states from the SQLite WAL.

## 1. Physical SQLite WAL (Durable Log)
When transactions execute, log entries are appended sequentially to the \`topology_journal\` table:

\`\`\`text
+-----------------------------------------------------------------------------------------------+
|                                    topology_journal Table                                     |
+----+-----------+------------+-------+--------------------+--------------------+---------------+
| ID | Chain ID  | Node ID    | Depth | Prev Receipt Hash  | Receipt Hash       | Status        |
+----+-----------+------------+-------+--------------------+--------------------+---------------+
| 1  | chain-abc | hook-alpha | 0     | null               | 0x8f2d... (hashA)  | confirmed     |
| 2  | chain-abc | hook-beta  | 1     | 0x8f2d... (hashA)  | 0x4c1e... (hashB)  | confirmed     |
| 3  | chain-abc | hook-gamma | 2     | 0x4c1e... (hashB)  | 0x3b9a... (hashC)  | confirmed     |
+----+-----------+------------+-------+--------------------+--------------------+---------------+
\`\`\`

## 2. Memory State Wiped (Simulated Crash)
If the Node.js process terminates abruptly or is restarted, all in-memory structures are lost:

\`\`\`text
[ Memory State: EMPTY ]
\`\`\`

## 3. Reconstruction Phase (reconstructTopologyState)
The membrane reloads all journal rows for the active chain and updates the local state mappings:

\`\`\`text
  Read Row 1 (hook-alpha) ---> Set stateAfter: { alpha: true }
  Read Row 2 (hook-beta)  ---> Set stateAfter: { beta: true }
  Read Row 3 (hook-gamma) ---> Set stateAfter: { gamma: true }

  [ Reconstructed State Map ]
  {
    "hook-alpha": { "alpha": true },
    "hook-beta":  { "beta": true },
    "hook-gamma": { "gamma": true }
  }
\`\`\`

## 4. Lineage Verification & Replay Phase (replayJournalLineage)
We verify that every receipt hash in the chain is authentic and that replaying inputs converges to the same state:

\`\`\`text
   (Start)
      │
      ▼
┌───────────┐
│  hashA    │ ◄─── verified with verifyReceipt()
└─────┬─────┘
      │  (Previous Receipt Hash pointer)
      ▼
┌───────────┐
│  hashB    │ ◄─── verified with verifyReceipt()
└─────┬─────┘
      │  (Previous Receipt Hash pointer)
      ▼
┌───────────┐
│  hashC    │ ◄─── verified with verifyReceipt()
└─────┬─────┘
      │
      ▼
┌─────────────────────────────────┐
│  VKG Projection State Hash      │
│  hash({alpha:true, beta:true})  │
└─────────────────────────────────┘
\`\`\`

## 5. Normalized Sort (Schedule Independence)
Even if independent branches write in a different order (e.g. B then A), sorting them alphabetically before hashing converges to the same topology hash:

\`\`\`text
   Unordered Lin 1: [A, B]  ---> generateReplayTopologyHash()  ---> 0x93ef... (Differs!)
   Unordered Lin 2: [B, A]  ---> generateReplayTopologyHash()  ---> 0x27ab... (Differs!)

   Normalized Lin 1: [A, B] ---> generateNormalizedReplayTopologyHash() ---> 0x55aa... (Matches!)
   Normalized Lin 2: [A, B] ---> generateNormalizedReplayTopologyHash() ---> 0x55aa... (Matches!)
\`\`\`
`.trim();
  }
}

export async function emitWalReconstructionVisualization() {
  const emitter = new WalReconstructionVisualizationEmitter();
  return emitter.emit();
}

const isMain = process.argv[1] && (
  process.argv[1].endsWith('emit-wal-reconstruction-visualization.ts') || 
  process.argv[1].endsWith('emit-wal-reconstruction-visualization.js') ||
  process.argv[1] === fileURLToPath(import.meta.url)
);

if (isMain) {
  emitWalReconstructionVisualization();
}
