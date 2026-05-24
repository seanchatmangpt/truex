import { hash } from './src/lib/gall-truex/hash-proof.js';
import { verifyConvergence } from './src/lib/gall-truex/replay-proof.js';
const μ = (input: number) => input * 2;
const expectedInputHash = hash(-0);
const expectedOutputHash = hash(μ(-0));
console.log(verifyConvergence(μ, -0, expectedInputHash, expectedOutputHash));
