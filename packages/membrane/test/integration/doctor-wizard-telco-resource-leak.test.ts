import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { WizardAgent } from '../../../../agents/wizard/agent.js';
import { TelcoAgent } from '../../../../agents/telco/agent.js';
import { DoctorAgent } from '../../../../agents/doctor/agent.js';

describe('Doctor + Wizard + Telco Resource Leak Integration Test', () => {
  it('should run 100 E2E integration cycles and verify memory stability', async () => {
    // 1. Force GC if available to establish a clean baseline
    if (globalThis.gc) {
      try {
        for (let i = 0; i < 5; i++) {
          globalThis.gc();
        }
      } catch {}
    }

    const initialMem = process.memoryUsage();
    const initialHeapMb = initialMem.heapUsed / 1024 / 1024;
    const initialRssMb = initialMem.rss / 1024 / 1024;

    const cycles = 100;
    const peakHeapUsed: number[] = [];
    const timings: number[] = [];

    const startTime = performance.now();

    // Temporarily redirect console logs to prevent Vitest from storing logs in memory
    const originalLog = console.log;
    const originalError = console.error;
    console.log = () => {};
    console.error = () => {};

    try {
      for (let i = 0; i < cycles; i++) {
        const cycleStart = performance.now();

        // --- WIZARD E2E CYCLE ---
        const wizard = new WizardAgent();
        // Valid simulation
        const wizardState = { score: 50 };
        const wizardTraceValid = wizard.simulateTransaction(wizardState, 75);
        expect(wizardTraceValid.find(t => t.step === 'Transaction Commit')?.success).toBe(true);
        expect(wizardState.score).toBe(75);

        // Invalid simulation (should rollback)
        const wizardTraceInvalid = wizard.simulateTransaction(wizardState, 150);
        expect(wizardTraceInvalid.find(t => t.step === 'Transaction Rollback')?.success).toBe(true);
        expect(wizardState.score).toBe(75); // preserved

        // --- TELCO E2E CYCLE ---
        const telco = new TelcoAgent();
        const telcoState = { balance: 100 };
        const { envelope, isValid } = telco.ingestTransition('payment_processed', 'user_gateway', telcoState, 150);
        expect(isValid).toBe(true);
        expect(telco.validateEnvelope(envelope)).toBe(true);

        // Tamper resistance test
        const tamperedEnvelope = JSON.parse(JSON.stringify(envelope));
        if (tamperedEnvelope.ocel && tamperedEnvelope.ocel.objectChanges && tamperedEnvelope.ocel.objectChanges[0]) {
          tamperedEnvelope.ocel.objectChanges[0]['ocel:value'] = 9999;
        }
        expect(telco.validateEnvelope(tamperedEnvelope)).toBe(false);

        // --- DOCTOR E2E CYCLE ---
        const doctor = new DoctorAgent();
        // Execute fast programmatic doctor proofs
        const proofTypes = ['telco-ingest', 'telco-validate', 'wizard-simulate', 'wizard-walkthrough'];
        for (const pt of proofTypes) {
          const report = await doctor.prove(pt, { skipWrite: true });
          expect(report.passed).toBe(true);
        }

        // Track peak heap usage during the cycles
        const currentMem = process.memoryUsage();
        peakHeapUsed.push(currentMem.heapUsed);

        const cycleEnd = performance.now();
        timings.push(cycleEnd - cycleStart);
      }
    } finally {
      // Restore original console loggers
      console.log = originalLog;
      console.error = originalError;
    }

    const endTime = performance.now();
    const totalDurationMs = endTime - startTime;
    const averageCycleDurationMs = totalDurationMs / cycles;

    // 2. Request GC again to release any collected garbage
    if (globalThis.gc) {
      try {
        for (let i = 0; i < 5; i++) {
          globalThis.gc();
        }
      } catch {}
    }

    const finalMem = process.memoryUsage();
    const finalHeapMb = finalMem.heapUsed / 1024 / 1024;
    const finalRssMb = finalMem.rss / 1024 / 1024;
    const heapDeltaMb = finalHeapMb - initialHeapMb;
    const rssDeltaMb = finalRssMb - initialRssMb;
    const maxPeakHeapMb = Math.max(...peakHeapUsed) / 1024 / 1024;

    console.log(`Resource Leak Audit Complete:`);
    console.log(`- Initial Heap: ${initialHeapMb.toFixed(3)} MB`);
    console.log(`- Final Heap: ${finalHeapMb.toFixed(3)} MB`);
    console.log(`- Heap Delta: ${heapDeltaMb.toFixed(3)} MB`);
    console.log(`- Peak Heap: ${maxPeakHeapMb.toFixed(3)} MB`);
    console.log(`- RSS Delta: ${rssDeltaMb.toFixed(3)} MB`);
    console.log(`- Total Duration: ${totalDurationMs.toFixed(3)} ms`);
    console.log(`- Average Cycle Duration: ${averageCycleDurationMs.toFixed(3)} ms`);

    // Verify heap stability. A difference of < 75MB (or < 15MB if GC is forced) proves no memory leaks
    const maxAllowedHeapDelta = globalThis.gc ? 15 : 75;
    expect(heapDeltaMb).toBeLessThan(maxAllowedHeapDelta);

    // 3. Record metrics to docs/benchmarks/unified-resource-leak.report.json
    const reportData = {
      case: 'doctor-wizard-telco-resource-leak',
      status: 'passed',
      cycles,
      metrics: {
        initialHeapMb: parseFloat(initialHeapMb.toFixed(3)),
        initialRssMb: parseFloat(initialRssMb.toFixed(3)),
        finalHeapMb: parseFloat(finalHeapMb.toFixed(3)),
        finalRssMb: parseFloat(finalRssMb.toFixed(3)),
        heapDeltaMb: parseFloat(heapDeltaMb.toFixed(3)),
        rssDeltaMb: parseFloat(rssDeltaMb.toFixed(3)),
        peakHeapMb: parseFloat(maxPeakHeapMb.toFixed(3)),
        totalDurationMs: parseFloat(totalDurationMs.toFixed(3)),
        averageCycleDurationMs: parseFloat(averageCycleDurationMs.toFixed(3))
      },
      timestamp: new Date().toISOString()
    };

    const reportPath = path.resolve(process.cwd(), 'docs', 'benchmarks', 'unified-resource-leak.report.json');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`📄 Report written to ${reportPath}`);
  });
});
