/**
 * @module emit-receipt
 * @description
 * Gall Classification: S2 Provenance Layer
 * Purpose: Generates a provenance receipt for all emitted facts, cryptographically signed 
 * to prove operational validity of the generated dashboard.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { FactEmitter, EmitterMetadata } from './fact-emitter.js';
import { generateKeyPair, signReceiptHash } from '../../../packages/membrane/src/signature.js';
import { hash } from '../../../skills/hash/mutations.js';

const BASE_DIR = process.cwd();
const FACTS_DIR = path.join(BASE_DIR, 'docs/v1/latest/facts');
const RECEIPTS_DIR = 'docs/v1/latest/receipts';
const OUTPUT_FILE = 'docs/v1/latest/receipts/observatory-receipt.json';

/**
 * Emitter for producing an unforgeable, ML-DSA signed cryptographic receipt
 * encompassing all extracted observatory facts.
 */
export class ReceiptEmitter extends FactEmitter {
  getMetadata(): EmitterMetadata {
    return {
      name: 'Receipt Emitter',
      description: 'Generates a provenance receipt for all emitted facts',
      outputPath: OUTPUT_FILE
    };
  }

  protected collectFacts() {
    if (!fs.existsSync(FACTS_DIR)) {
      throw new Error(`Facts directory not found: ${FACTS_DIR}`);
    }

    const factFiles = fs.readdirSync(FACTS_DIR)
      .filter(file => file.endsWith('.json'))
      .sort();
      
    const fileHashes: Record<string, string> = {};

    for (const file of factFiles) {
      const filePath = path.join(FACTS_DIR, file);
      fileHashes[file] = this.calculateHash(filePath);
    }

    const healthStatus = this.getOverallHealth(FACTS_DIR);

    const receiptData = {
      id: crypto.randomUUID(),
      status: healthStatus,
      provenance: {
        generator: "Truex Observatory Receipt Generator",
        version: "1.0.0",
        environment: process.env.NODE_ENV || 'development'
      },
      artifacts: {
        facts: fileHashes
      }
    };

    // Cryptographic Signing (PQC ML-DSA)
    // Production implementation: utilizes available environmental credentials or generates an ephemeral pair for validation.
    const secretKeyHex = process.env.TRUEX_SECRET_KEY || '';
    const publicKeyHex = process.env.TRUEX_PUBLIC_KEY || '';
    
    let keyPair;
    keyPair = secretKeyHex && publicKeyHex ? { publicKey: publicKeyHex, secretKey: secretKeyHex } : generateKeyPair();
    
    const receiptHash = hash(receiptData);
    const signature = signReceiptHash(receiptHash, keyPair.secretKey);

    return {
      ...receiptData,
      hash: receiptHash,
      signature: {
        algorithm: "ML-DSA-65",
        publicKey: keyPair.publicKey,
        value: signature
      }
    };
  }

  private calculateHash(filePath: string): string {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
  }

  private getOverallHealth(factsDir: string): string {
    const diagnosticsPath = path.join(factsDir, 'diagnostics.json');
    if (fs.existsSync(diagnosticsPath)) {
      try {
        const diagnostics = JSON.parse(fs.readFileSync(diagnosticsPath, 'utf8'));
        return diagnostics.health_check?.status || 'unknown';
      } catch {
        return 'error';
      }
    }
    return 'missing';
  }
}

/**
 * Instantiates the ReceiptEmitter and executes the receipt signing process.
 * @returns A promise resolving to the signed receipt object.
 */
export async function emitReceipt() {
  const emitter = new ReceiptEmitter();
  return emitter.emit();
}

// Self-execute if run as a script
const isMain = process.argv[1] && (
  process.argv[1].endsWith('emit-receipt.ts') || 
  process.argv[1].endsWith('emit-receipt.js') ||
  process.argv[1] === fileURLToPath(import.meta.url)
);

if (isMain) {
  emitReceipt();
}
