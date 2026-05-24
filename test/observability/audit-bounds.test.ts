import { describe, it, expect, afterEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { createProxy } from "../../src/proxy/create-proxy.js";
import {
  createAuditContext,
  registerAuditInterceptors,
} from "../../src/observability/audit-logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Audit Logger - Boundary Enforcements", () => {
  const diskPath = path.join(__dirname, "temp-overflow.log");
  const sqlitePath = path.join(__dirname, "temp-audit.db");

  afterEach(() => {
    // Clean up temporary files
    if (fs.existsSync(diskPath)) {
      try {
        fs.unlinkSync(diskPath);
      } catch {}
    }
    if (fs.existsSync(sqlitePath)) {
      try {
        fs.unlinkSync(sqlitePath);
      } catch {}
    }
  });

  describe("Stack Trace Limits & Behaviors", () => {
    it("should enforce a hard budget on stored traces (truncate)", () => {
      const target = { count: 0 };
      const proxyInterface = createProxy(target);
      const proxy = proxyInterface.proxy as any;

      const auditCtx = createAuditContext(target, {
        includeStackTrace: true,
        maxStoredTraces: 5,
        stackTraceBehavior: "truncate",
        filters: (op: any) => op.trap === "set",
      });

      registerAuditInterceptors(proxyInterface, auditCtx);

      auditCtx.call(() => {
        for (let i = 0; i < 15; i++) {
          proxy.count = i;
        }
      });

      const log = auditCtx.getAuditLog();
      expect(log.length).toBe(15);

      // First 5 should have stackTrace
      for (let i = 0; i < 5; i++) {
        expect(log[i].stackTrace).toBeTypeOf("string");
      }

      // Next 10 should not have stackTrace property
      for (let i = 5; i < 15; i++) {
        expect(log[i].stackTrace).toBeUndefined();
      }
    });

    it("should enforce a hard budget on stored traces (redact)", () => {
      const target = { count: 0 };
      const proxyInterface = createProxy(target);
      const proxy = proxyInterface.proxy as any;

      const auditCtx = createAuditContext(target, {
        includeStackTrace: true,
        maxStoredTraces: 5,
        stackTraceBehavior: "redact",
        filters: (op: any) => op.trap === "set",
      });

      registerAuditInterceptors(proxyInterface, auditCtx);

      auditCtx.call(() => {
        for (let i = 0; i < 10; i++) {
          proxy.count = i;
        }
      });

      const log = auditCtx.getAuditLog();
      expect(log.length).toBe(10);

      // First 5 should have stackTrace
      for (let i = 0; i < 5; i++) {
        expect(log[i].stackTrace).toBeTypeOf("string");
        expect(log[i].stackTrace).not.toContain("[REDACTED: limit reached]");
      }

      // Next 5 should be redacted
      for (let i = 5; i < 10; i++) {
        expect(log[i].stackTrace).toBe("[REDACTED: limit reached]");
      }
    });

    it("should enforce a hard budget on stored traces (hash-compressed)", () => {
      const target = { count: 0 };
      const proxyInterface = createProxy(target);
      const proxy = proxyInterface.proxy as any;

      const auditCtx = createAuditContext(target, {
        includeStackTrace: true,
        maxStoredTraces: 3,
        stackTraceBehavior: "hash",
        filters: (op: any) => op.trap === "set",
      });

      registerAuditInterceptors(proxyInterface, auditCtx);

      auditCtx.call(() => {
        for (let i = 0; i < 6; i++) {
          proxy.count = i;
        }
      });

      const log = auditCtx.getAuditLog();
      expect(log.length).toBe(6);

      // First 3 should have stackTrace
      for (let i = 0; i < 3; i++) {
        expect(log[i].stackTrace).toBeTypeOf("string");
        expect(log[i].stackTrace).not.toContain("[HASH:");
      }

      // Next 3 should have hash representation
      for (let i = 3; i < 6; i++) {
        expect(log[i].stackTrace).toMatch(/^\[HASH:[a-f0-9]{64}\]$/);
      }
    });
  });

  describe("Log Saturation & Memory Bounds", () => {
    it("should refuse new entries when overflowBehavior is refuse", () => {
      const target = { count: 0 };
      const proxyInterface = createProxy(target);
      const proxy = proxyInterface.proxy as any;

      const auditCtx = createAuditContext(target, {
        maxLogEntries: 5,
        overflowBehavior: "refuse",
        filters: (op: any) => op.trap === "set",
      });

      registerAuditInterceptors(proxyInterface, auditCtx);

      auditCtx.call(() => {
        for (let i = 0; i < 12; i++) {
          proxy.count = i;
        }
      });

      const log = auditCtx.getAuditLog();
      // Only the first 5 log entries should be retained
      expect(log.length).toBe(5);
      expect(log[0].value).toBe(0);
      expect(log[4].value).toBe(4);

      // 7 entries should have been refused/flushed
      expect(auditCtx.getFlushedCount()).toBe(7);
    });

    it("should truncate older entries (FIFO) when overflowBehavior is truncate", () => {
      const target = { count: 0 };
      const proxyInterface = createProxy(target);
      const proxy = proxyInterface.proxy as any;

      const auditCtx = createAuditContext(target, {
        maxLogEntries: 4,
        overflowBehavior: "truncate",
        filters: (op: any) => op.trap === "set",
      });

      registerAuditInterceptors(proxyInterface, auditCtx);

      auditCtx.call(() => {
        for (let i = 0; i < 10; i++) {
          proxy.count = i;
        }
      });

      const log = auditCtx.getAuditLog();
      // Should keep exactly 4 entries in memory
      expect(log.length).toBe(4);
      // Older entries are removed, so we should have the last 4 entries
      expect(log.map((e) => e.value)).toEqual([6, 7, 8, 9]);
      expect(auditCtx.getFlushedCount()).toBe(6);
    });

    it("should compress older entries (rolling hash) when overflowBehavior is compress", () => {
      const target = { count: 0 };
      const proxyInterface = createProxy(target);
      const proxy = proxyInterface.proxy as any;

      const auditCtx = createAuditContext(target, {
        maxLogEntries: 3,
        overflowBehavior: "compress",
        filters: (op: any) => op.trap === "set",
      });

      registerAuditInterceptors(proxyInterface, auditCtx);

      auditCtx.call(() => {
        for (let i = 0; i < 7; i++) {
          proxy.count = i;
        }
      });

      const log = auditCtx.getAuditLog();
      expect(log.length).toBe(3);
      expect(log.map((e) => e.value)).toEqual([4, 5, 6]);

      expect(auditCtx.getFlushedCount()).toBe(4);
      const rollingHash = auditCtx.getRollingHash();
      expect(rollingHash).toMatch(/^[a-f0-9]{64}$/);

      const compressed = auditCtx.getCompressedLogs();
      // Should have stored the compressed logs metadata
      expect(compressed.length).toBe(4);
      expect(compressed[0].status).toBe("compressed");
      expect(compressed[0].hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it("should spill over to SQLite when overflowBehavior is sqlite", () => {
      const target = { count: 0 };
      const proxyInterface = createProxy(target);
      const proxy = proxyInterface.proxy as any;

      const auditCtx = createAuditContext(target, {
        maxLogEntries: 3,
        overflowBehavior: "sqlite",
        sqlitePath,
        filters: (op: any) => op.trap === "set",
      });

      registerAuditInterceptors(proxyInterface, auditCtx);

      auditCtx.call(() => {
        for (let i = 0; i < 8; i++) {
          proxy.count = i;
        }
      });

      const log = auditCtx.getAuditLog();
      expect(log.length).toBe(3);
      expect(log.map((e) => e.value)).toEqual([5, 6, 7]);

      expect(auditCtx.getFlushedCount()).toBe(5);

      const sqliteLogs = auditCtx.getFlushedLogsSqlite();
      expect(sqliteLogs.length).toBe(5);
      expect(sqliteLogs.map((e) => e.value)).toEqual([0, 1, 2, 3, 4]);

      // Test clearLog clean up
      auditCtx.clearLog();
      expect(auditCtx.getAuditLog().length).toBe(0);
      expect(auditCtx.getFlushedLogsSqlite().length).toBe(0);
      expect(auditCtx.getFlushedCount()).toBe(0);

      auditCtx.close();
    });

    it("should spill over to disk when overflowBehavior is disk", () => {
      const target = { count: 0 };
      const proxyInterface = createProxy(target);
      const proxy = proxyInterface.proxy as any;

      const auditCtx = createAuditContext(target, {
        maxLogEntries: 3,
        overflowBehavior: "disk",
        diskPath,
        filters: (op: any) => op.trap === "set",
      });

      registerAuditInterceptors(proxyInterface, auditCtx);

      auditCtx.call(() => {
        for (let i = 0; i < 6; i++) {
          proxy.count = i;
        }
      });

      const log = auditCtx.getAuditLog();
      expect(log.length).toBe(3);
      expect(log.map((e) => e.value)).toEqual([3, 4, 5]);

      expect(auditCtx.getFlushedCount()).toBe(3);

      const diskLogs = auditCtx.getFlushedLogsDisk();
      expect(diskLogs.length).toBe(3);
      expect(diskLogs.map((e) => e.value)).toEqual([0, 1, 2]);

      // Test clearLog clean up
      auditCtx.clearLog();
      expect(auditCtx.getAuditLog().length).toBe(0);
      expect(auditCtx.getFlushedLogsDisk().length).toBe(0);
      expect(auditCtx.getFlushedCount()).toBe(0);
    });
  });
});
