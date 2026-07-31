/**
 * Truex public substrate API.
 *
 * The root package exposes only admitted primitives and capability metadata.
 * Higher-order orchestration remains behind explicit Doctor/Wizard/Telco verbs.
 */
export {
  TRUEX_CAPABILITIES,
  capabilityMapDigestInput,
  findDuplicateJsonKeys,
  getCapability,
  resolveCapabilityClosure,
  validateCapabilityRegistry,
} from './capabilities.js';
export type {
  CapabilityKind,
  CapabilityStanding,
  CapabilityValidation,
  TruexCapability,
} from './capabilities.js';

export { createDeterministicContext, useContext } from '../packages/membrane/src/context.js';
export type { TruexContext } from '../packages/membrane/src/context.js';
export { hash, stableJson } from '../skills/hash/mutations.js';
export { createReceipt, generateKeyPair, signReceiptHash, verifySignature } from '../skills/receipt/mutations.js';
export { verifyChain, verifyReceipt } from '../skills/receipt/invariant.js';
export { AndonSystem, PokaYoke } from '../packages/membrane/src/manufacturing/jidoka.js';
export { StorehouseManager, admitTruexControlPlaneBblock } from '../packages/storehouse/src/index.js';
export type { AdmittedGgenBblock, GgenBblockPlan, GgenBblockReceipt, StorehouseReceipt } from '../packages/storehouse/src/index.js';
export { VowMembrane, createVowContext } from '../packages/vow/src/index.js';
export type { VowRecord, VowState } from '../packages/vow/src/index.js';
