import { canonicalStringify } from "../skills/membrane/mutations.js";
import { hash } from "../packages/membrane/src/index.js";
import * as fs from 'node:fs';

const env = JSON.parse(fs.readFileSync('scratch/valid_env.json', 'utf8'));

function normalizeOcelForVerification(ocel: any) {
  if (!ocel || !Array.isArray(ocel.events)) return ocel;
  const normalizedEvents = ocel.events.map((evt: any) => {
    if (!evt || !evt['ocel:attributes']) return evt;
    const attrs = { ...evt['ocel:attributes'] };
    if (!('causationId' in attrs)) attrs.causationId = undefined;
    if (!('correlationId' in attrs)) attrs.correlationId = undefined;
    return {
      ...evt,
      'ocel:attributes': attrs
    };
  });
  return {
    ...ocel,
    events: normalizedEvents
  };
}

const normalizedOcel = normalizeOcelForVerification(env.ocel);
const canonicalFile = canonicalStringify(normalizedOcel);
const fileBatchHash = hash(canonicalFile);
console.log("File batch hash normalized:", fileBatchHash);
console.log("Expected batch hash:       ", env.ocelBatchHash);
console.log("Match:", fileBatchHash === env.ocelBatchHash);
