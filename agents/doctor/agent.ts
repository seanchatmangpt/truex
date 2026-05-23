/* eslint-disable unicorn/no-null */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { proveHash } from "../../skills/hash/proofs.js";
import { proveReceipt } from "../../skills/receipt/proofs.js";
import { proveReplay, proveEngine, proveSqlite } from "../../skills/replay/proofs.js";
import { proveMembrane } from "../../skills/membrane/proofs.js";
import { proveAdapter } from "../../skills/adapter/proofs.js";
import { proveHook } from "../../skills/hook/proofs.js";

export type TruexProofReport = {
  primitive: string;
  passed: boolean;
  invariants: string[];
  failures: string[];
  timings: Record<string, number>;
  receiptHash?: string;
};

export class DoctorAgent {
  prove(primitive: string): TruexProofReport {
    console.log(`\n🩺 Doctor running proof for primitive: "${primitive}"...`);
    const start = Date.now();
    let result: { passed: boolean; failures: string[]; invariants: string[]; receiptHash?: string };

    switch (primitive) {
      case "hash": {
        result = proveHash();
        break;
      }
      case "receipt":
      case "signature": {
        result = proveReceipt();
        break;
      }
      case "replay": {
        result = proveReplay();
        break;
      }
      case "engine": {
        result = proveEngine();
        break;
      }
      case "sqlite": {
        result = proveSqlite();
        break;
      }
      case "membrane": {
        result = proveMembrane();
        break;
      }
      case "adapter": {
        result = proveAdapter();
        break;
      }
      case "hook": {
        result = proveHook();
        break;
      }
      default: {
        throw new Error(`Unknown primitive: "${primitive}"`);
      }
    }

    const duration = Date.now() - start;
    const report: TruexProofReport = {
      primitive,
      passed: result.passed,
      invariants: result.invariants,
      failures: result.failures,
      timings: { execution: duration },
      receiptHash: result.receiptHash
    };

    this.writeReport(primitive, report);
    
    if (result.passed) {
      console.log(`✅ Primitive "${primitive}" proven successfully.`);
      for (const inv of result.invariants) {
        console.log(`   - Invariant verified: ${inv}`);
      }
    } else {
      console.error(`❌ Primitive "${primitive}" failed proof.`);
      for (const fail of result.failures) {
        console.error(`   - Failure: ${fail}`);
      }
    }

    return report;
  }

  private writeReport(name: string, report: TruexProofReport): void {
    const reportPath = path.resolve(process.cwd(), 'docs', 'vision2030', `${name}-proof.report.json`);
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Report written to ${reportPath}`);
  }
}
