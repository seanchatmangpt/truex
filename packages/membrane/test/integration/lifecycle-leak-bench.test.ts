import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { ProjectCell, ProjectMapper, CheckpointPlanner, ExecutionEngine, MissionController } from '../../src/project-wizard.gall.js';
import { TelcoLifecycleManager } from '../../src/telco.gall.js';

describe('Unified E2E Lifecycle Memory Leak and Performance Benchmark', () => {
  const NUM_LOOPS = 50;

  it(`should successfully run ${NUM_LOOPS} E2E loops, verify memory stability, and benchmark durations`, () => {
    const timings: Record<string, number[]> = {
      init: [],
      map: [],
      plan: [],
      forge: [],
      bind: [],
      prove: [],
      listen: [],
      dial: [],
      handshake: [],
      encode: [],
      route: [],
      transmit: [],
      verify: [],
      settle: [],
      handoff: []
    };

    // Force GC before measuring memory if possible
    if (global.gc) {
      global.gc();
    }
    const memBefore = process.memoryUsage();
    const cpuBefore = process.cpuUsage();
    const startTimeOverall = performance.now();

    for (let i = 0; i < NUM_LOOPS; i++) {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `truex-leak-bench-${i}-`));
      
      try {
        // --- 1. init ---
        const cell = new ProjectCell(tempDir);
        const tInitStart = performance.now();
        cell.init({
          path: tempDir,
          mission: 'Perform unified E2E stress and memory benchmark on Wizard + Telco',
          durationHours: 12,
          agents: 5,
          status: 'initialized'
        });
        timings.init.push(performance.now() - tInitStart);

        // --- 2. map ---
        const tMapStart = performance.now();
        const mapper = new ProjectMapper(cell);
        const { topology } = mapper.map();
        timings.map.push(performance.now() - tMapStart);

        // --- 3. plan ---
        const tPlanStart = performance.now();
        const planner = new CheckpointPlanner(cell);
        const { registry } = planner.plan(topology);
        timings.plan.push(performance.now() - tPlanStart);

        // --- 4. forge ---
        const tForgeStart = performance.now();
        const engine = new ExecutionEngine(cell);
        for (const cp of registry) {
          engine.forge(cp.id);
        }
        timings.forge.push(performance.now() - tForgeStart);

        // --- 5. bind ---
        const tBindStart = performance.now();
        for (const cp of registry) {
          engine.bind(cp.id);
        }
        timings.bind.push(performance.now() - tBindStart);

        // --- 6. prove ---
        const tProveStart = performance.now();
        for (const cp of registry) {
          engine.prove(cp.id);
        }
        timings.prove.push(performance.now() - tProveStart);

        // --- Telco Verbs (7 to 14) ---
        const telco = new TelcoLifecycleManager();

        // 7. listen
        const tListenStart = performance.now();
        const channel = telco.listen('ch-1', 'protocol-alpha', 'binding-1', {});
        timings.listen.push(performance.now() - tListenStart);

        // 8. dial
        const tDialStart = performance.now();
        const peer = telco.dial('peer-1', 'valid-proof');
        timings.dial.push(performance.now() - tDialStart);

        // 9. handshake
        const tHandshakeStart = performance.now();
        const capability = {
          capabilityId: 'cap-1',
          epoch: 1,
          allowedActionFamilies: ['read', 'write']
        };
        const session = telco.handshake(
          peer.id,
          channel.id,
          'protocol-alpha',
          1,
          capability,
          Date.now(),
          Date.now() + 60000
        );
        timings.handshake.push(performance.now() - tHandshakeStart);

        // 10. encode
        const tEncodeStart = performance.now();
        const packet = telco.encode(session.id, [{ value: 42 }]);
        timings.encode.push(performance.now() - tEncodeStart);

        // 11. route
        const tRouteStart = performance.now();
        const routeDecision = telco.route(packet.id, channel.id, 'retry-policy-1');
        timings.route.push(performance.now() - tRouteStart);

        // 12. transmit
        const tTransmitStart = performance.now();
        const txRecord = telco.transmit(packet.id, channel.id, 'sent');
        timings.transmit.push(performance.now() - tTransmitStart);

        // 13. verify
        const tVerifyStart = performance.now();
        const expectedAckData = { ack: true, packetId: packet.id };
        telco.verify(txRecord.id, expectedAckData);
        timings.verify.push(performance.now() - tVerifyStart);

        // 14. settle
        const tSettleStart = performance.now();
        telco.settle(session.id);
        timings.settle.push(performance.now() - tSettleStart);

        // Verify Telco ledger conservation
        telco.verifyLedgerConservation();

        // --- 15. handoff ---
        // Mock elapsed 12H gate by warping start.json timestamp
        const startPath = path.join(tempDir, '.truex', 'mission', 'start.json');
        const startData = JSON.parse(fs.readFileSync(startPath, 'utf8'));
        startData.startTime = new Date(Date.now() - 13 * 3600 * 1000).toISOString(); // 13h ago
        fs.writeFileSync(startPath, JSON.stringify(startData, null, 2));

        // Create mock 12H agent reports
        const reportsDir = path.join(tempDir, 'docs', 'reports');
        fs.mkdirSync(reportsDir, { recursive: true });
        for (let j = 1; j <= 5; j++) {
          const names = [
            `12h-agent-${j}-wizard-cli.md`,
            `12h-agent-${j}-project-cell-topology.md`,
            `12h-agent-${j}-gall-checkpoint-planner.md`,
            `12h-agent-${j}-forge-bind-prove-harden.md`,
            `12h-agent-${j}-mission-handoff.md`
          ];
          fs.writeFileSync(path.join(reportsDir, names[j - 1]), '# Mock report metadata', 'utf8');
        }

        const tHandoffStart = performance.now();
        const controller = new MissionController(cell);
        controller.verifyHandoff({
          requireElapsed: true,
          requireGallCheckpoints: true,
          requireAgentReports: 5
        });

        const accPath = cell.resolvePath('.truex/reports/accounting.json');
        const acc = JSON.parse(fs.readFileSync(accPath, 'utf8'));
        controller.finalize({
          W1: 'Conserved',
          W2: 'Conserved',
          W3: 'Conserved',
          W4: 'Conserved',
          W5: 'Conserved',
          counts: acc
        });
        timings.handoff.push(performance.now() - tHandoffStart);

      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    }

    const overallDurationMs = performance.now() - startTimeOverall;

    // Force GC again before final memory measurement
    if (global.gc) {
      global.gc();
    }
    const memAfter = process.memoryUsage();
    const cpuUsageDiff = process.cpuUsage(cpuBefore);

    const heapDelta = memAfter.heapUsed - memBefore.heapUsed;
    const heapDeltaMB = heapDelta / (1024 * 1024);

    // Compute stats for each verb
    const stats: Record<string, { min: number; max: number; avg: number; median: number; throughput: number }> = {};
    for (const [verb, times] of Object.entries(timings)) {
      const sorted = [...times].sort((a, b) => a - b);
      const min = sorted[0] || 0;
      const max = sorted[sorted.length - 1] || 0;
      const sum = times.reduce((s, x) => s + x, 0);
      const avg = times.length > 0 ? sum / times.length : 0;
      const median = sorted.length > 0
        ? (sorted.length % 2 === 0
          ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
          : sorted[Math.floor(sorted.length / 2)])
        : 0;
      const throughput = avg > 0 ? 1000 / avg : 0;

      stats[verb] = { min, max, avg, median, throughput };
    }

    const reportJson = {
      timestamp: new Date().toISOString(),
      loops: NUM_LOOPS,
      overallDurationMs,
      cpu: {
        userMicroseconds: cpuUsageDiff.user,
        systemMicroseconds: cpuUsageDiff.system,
        totalMicroseconds: cpuUsageDiff.user + cpuUsageDiff.system,
        totalMs: (cpuUsageDiff.user + cpuUsageDiff.system) / 1000
      },
      memory: {
        before: memBefore,
        after: memAfter,
        heapDeltaBytes: heapDelta,
        heapDeltaMB,
        gcForced: typeof global.gc === 'function'
      },
      statistics: stats,
      rawTimings: timings
    };

    // Save outputs
    const benchmarksDir = path.join(process.cwd(), 'docs', 'benchmarks');
    fs.mkdirSync(benchmarksDir, { recursive: true });

    const jsonReportPath = path.join(benchmarksDir, 'lifecycle-performance.report.json');
    fs.writeFileSync(jsonReportPath, JSON.stringify(reportJson, null, 2), 'utf8');

    // Build Markdown report
    const mdContent = `
# TRUEX Unified E2E Lifecycle Performance & Leak Report

Generated: ${reportJson.timestamp}
Loops Run: ${NUM_LOOPS}
Total Execution Time: ${overallDurationMs.toFixed(2)} ms

## 1. Memory Analysis & Leak Detection
To assert operational stability and verify the lack of state leaks, heap memory is measured before and after the test loop execution.

| Metric | Value |
| --- | --- |
| Heap Used Before | ${(memBefore.heapUsed / (1024 * 1024)).toFixed(2)} MB |
| Heap Used After | ${(memAfter.heapUsed / (1024 * 1024)).toFixed(2)} MB |
| **Heap Delta** | **${heapDeltaMB.toFixed(2)} MB** |
| GC Forced | ${reportJson.memory.gcForced ? 'Yes' : 'No'} |
| **Status** | **${heapDeltaMB < (reportJson.memory.gcForced ? 25 : 60) ? 'PASSED (Stable)' : 'FAILED (Leaking)'}** |

## 2. CPU Consumption
- **User CPU Time:** ${(cpuUsageDiff.user / 1000).toFixed(2)} ms
- **System CPU Time:** ${(cpuUsageDiff.system / 1000).toFixed(2)} ms
- **Total CPU time:** ${((cpuUsageDiff.user + cpuUsageDiff.system) / 1000).toFixed(2)} ms

## 3. Verb Benchmarks
Each individual verb in the S11 (Wizard) and S13 (Telco) lifecycles was profiled over ${NUM_LOOPS} loops.

| Verb | Avg Duration (ms) | Median (ms) | Min (ms) | Max (ms) | Throughput (ops/sec) |
| --- | --- | --- | --- | --- | --- |
${Object.entries(stats).map(([verb, s]) => {
  return `| \`${verb}\` | ${s.avg.toFixed(4)} | ${s.median.toFixed(4)} | ${s.min.toFixed(4)} | ${s.max.toFixed(4)} | ${s.throughput.toFixed(1)} |`;
}).join('\n')}

## 4. Invariant & Conservation Verification
- **W1 - W5 Conservation:** Confirmed conserved by \`MissionController.verifyHandoff\` and \`MissionController.finalize\` on every iteration.
- **T1 - T6 Conservation:** Evaluated and verified valid by \`TelcoLifecycleManager.verifyLedgerConservation\` on every iteration.
`.trim();

    const mdReportPath = path.join(benchmarksDir, 'lifecycle-performance.report.md');
    fs.writeFileSync(mdReportPath, mdContent, 'utf8');

    // Assert memory stability rule: <25MB if GC forced, <60MB otherwise
    const maxAllowedDelta = reportJson.memory.gcForced ? 25 : 60;
    expect(heapDeltaMB).toBeLessThan(maxAllowedDelta);
  });
});
