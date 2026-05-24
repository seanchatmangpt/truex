import { OcelCollector, canonicalStringify } from "../skills/membrane/mutations.js";
import { TelcoAgent } from "../agents/telco/agent.js";
import { hash } from "../packages/truex-core/src/index.js";

const agent = new TelcoAgent();
const sample = agent.ingestTransition(
  'activate_subscription',
  'user_1',
  { balance: 100 },
  120
);

const canonicalIngested = canonicalStringify(sample.envelope.ocel);
const computedBatchHash = hash(canonicalIngested);

console.log("Ingested batch hash:", sample.envelope.ocelBatchHash);
console.log("Computed batch hash:", computedBatchHash);

import * as fs from 'node:fs';
const fileEnv = JSON.parse(fs.readFileSync('scratch/valid_env.json', 'utf8'));
const canonicalFile = canonicalStringify(fileEnv.ocel);
const fileBatchHash = hash(canonicalFile);
console.log("File batch hash:", fileBatchHash);

console.log("canonicalIngested === canonicalFile:", canonicalIngested === canonicalFile);
if (canonicalIngested !== canonicalFile) {
  console.log("Diff:");
  console.log("Ingested:", canonicalIngested);
  console.log("File:    ", canonicalFile);
}
