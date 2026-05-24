import { ml_dsa65 } from '@noble/post-quantum/ml-dsa.js';
import { generateKeyPair } from './src/lib/gall-truex/signature-proof.js';
import { hexToBytes, utf8ToBytes } from '@noble/hashes/utils.js';
const k = generateKeyPair();
const msg = utf8ToBytes("some message");
const sk = hexToBytes(k.secretKey);
const pk = hexToBytes(k.publicKey);
const sig = ml_dsa65.sign(msg, sk);
console.log("sign works");
try { console.log(ml_dsa65.verify(pk, msg, sig), "verify pk, msg, sig"); } catch{}
try { console.log(ml_dsa65.verify(sig, msg, pk), "verify sig, msg, pk"); } catch{}
try { console.log(ml_dsa65.verify(msg, sig, pk), "verify msg, sig, pk"); } catch{}
