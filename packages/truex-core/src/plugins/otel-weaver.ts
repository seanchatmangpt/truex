import { defineCittyPlugin } from 'citty';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * OCEL 2.0 to OpenTelemetry (OTel) Weaver Plugin
 * 
 * This Citty plugin intercepts CLI execution to dynamically weave 
 * Truex OCEL receipts into OpenTelemetry trace structures.
 * It provides a live-check of operational execution, linking 
 * command runs (spans) to their underlying cryptographic receipts.
 */

export const OcelOtelWeaverPlugin = defineCittyPlugin({
  name: 'ocel-otel-weaver',
  
  setup({ args, cmd }) {
    // Inject trace context before the command runs
    const traceId = `trace-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const startTime = Date.now();
    
    // Store in global or execution context so the runtime can attach to it
    (globalThis as any).__OTEL_TRACE__ = {
      traceId,
      spanId: `span-${cmd?.meta?.name || 'unknown'}`,
      startTime,
      attributes: {
        command: cmd?.meta?.name,
        args: JSON.stringify(args)
      },
      events: []
    };
    
    process.stderr.write(`[OTel Weaver] Started trace ${traceId} for command: ${cmd?.meta?.name}\n`);
  },

  cleanup({ args, subCommand }) {
    const traceCtx = (globalThis as any).__OTEL_TRACE__;
    if (!traceCtx) return;

    traceCtx.endTime = Date.now();
    traceCtx.durationMs = traceCtx.endTime - traceCtx.startTime;

    process.stderr.write(`[OTel Weaver] Debug args: ${JSON.stringify(args)}\n`);
    let primitive = args._?.[args._.length - 1] || 'unknown';

    // Scan for OCEL receipts generated during this run
    const receiptDir = path.resolve(process.cwd(), 'docs/vision2030');
    let receiptAttached = false;
    
    if (fs.existsSync(receiptDir) && primitive !== 'unknown') {
      const reportFile = path.join(receiptDir, `${primitive}-proof.report.json`);
      
      process.stderr.write(`[OTel Weaver] Looking for report: ${reportFile}\n`);

      if (fs.existsSync(reportFile)) {
        process.stderr.write(`[OTel Weaver] Report found. Reading...\n`);
        try {
          const report = JSON.parse(fs.readFileSync(reportFile, 'utf-8'));
          
          // Attach both standard and array-based (e.g. benchmark) receipt hashes if present
          const attachedReceiptHash = report.receiptHash || (report.benchmark && report.benchmark.reportHash);
          
          traceCtx.events.push({
            name: attachedReceiptHash ? 'ocel.receipt.generated' : 'doctor.proof.evaluated',
            timestamp: Date.now(),
            attributes: {
              primitive: primitive,
              receiptHash: attachedReceiptHash || undefined,
              status: report.passed ? 'confirmed' : 'refused',
              executionTimeMs: report.timings?.execution || traceCtx.durationMs,
              invariantsCount: report.invariants?.length || 0,
              failuresCount: report.failures?.length || 0
            }
          });
          receiptAttached = !!attachedReceiptHash;
        } catch (e) {
          // Ignore parsing errors
        }
      }
    }

    // Emit the OpenTelemetry Trace Span JSON
    const otelOutputDir = path.resolve(process.cwd(), 'docs/telemetry');
    if (!fs.existsSync(otelOutputDir)) {
      fs.mkdirSync(otelOutputDir, { recursive: true });
    }
    
    const traceFile = path.join(otelOutputDir, `${traceCtx.traceId}.json`);
    fs.writeFileSync(traceFile, JSON.stringify(traceCtx, null, 2));

    process.stderr.write(`[OTel Weaver] Trace emitted. Receipts attached: ${receiptAttached}. Duration: ${traceCtx.durationMs}ms\n`);
    
    delete (globalThis as any).__OTEL_TRACE__;
  }
});
