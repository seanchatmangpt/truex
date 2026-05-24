/**
 * @module audit-engine
 * @description High-level query engine for historical traces and causality.
 * Gall Classification: S2 (engine primitives).
 * Follows the causal chain of operations.
 */
import type { Database } from 'better-sqlite3';
import { type Receipt } from '../runtime-law.js';
import { SQLiteReceiptStore } from './receipt-store.js';

/**
 * HistoricalTrace represents a receipt enriched with its triggering event and associated delta.
 */
export type HistoricalTrace = {
  receipt: Receipt;
  event?: {
    id: string;
    type: string;
    hookId: string | null;
    createdAt: string;
  };
  delta?: {
    id: string;
    createdAt: string;
  };
};

/**
 * AuditEngine: High-level API for querying persistence for historical traces and causality.
 * Implements Gall Law S5: A complex system that works is invariably found to have evolved from a simple system that works.
 */
export class AuditEngine {
  private receiptStore: SQLiteReceiptStore;

  constructor(private db: Database) {
    this.receiptStore = new SQLiteReceiptStore(db);
  }

  /**
   * Returns the full causal chain of receipts starting from a specific receipt hash.
   * It follows the previousReceiptHash pointers backwards in time.
   */
  getCausalChain(startReceiptHash: string): Receipt[] {
    const chain: Receipt[] = [];
    let currentHash: string | null = startReceiptHash;

    while (currentHash) {
      const receipt = this.receiptStore.findByHash(currentHash);
      if (!receipt) break;
      chain.push(receipt);
      currentHash = receipt.previousReceiptHash;
    }

    return chain;
  }

  /**
   * Queries for who changed a specific subject at or before a given time.
   * "Who" is represented by the event that triggered the change.
   * Returns the full receipted causal chain leading to that change.
   * 
   * @param subject - The subject (URI or ID) to query for.
   * @param timeT - Optional ISO string or timestamp to limit the search.
   * @returns A causal chain of enriched traces.
   */
  whoChanged(subject: string, timeT?: string | number): HistoricalTrace[] {
    // 1. Find the latest delta that affected this subject before or at time T
    let query = `
      SELECT q.delta_id
      FROM quads q
      JOIN deltas d ON q.delta_id = d.id
      WHERE q.subject = ?
    `;
    const params: any[] = [subject];

    if (timeT) {
      query += ` AND d.created_at <= ?`;
      params.push(typeof timeT === 'number' ? new Date(timeT).toISOString() : timeT);
    }

    query += ` ORDER BY d.created_at DESC LIMIT 1`;

    const row = this.db.prepare(query).get(...params) as { delta_id: string } | undefined;

    if (!row) {
      return [];
    }

    // 2. Find the receipt for this delta
    const receiptRow = this.db.prepare('SELECT receipt_hash FROM receipts WHERE delta_id = ?').get(row.delta_id) as { receipt_hash: string } | undefined;

    if (!receiptRow) {
      return [];
    }

    // 3. Get the causal chain of receipts
    const receipts = this.getCausalChain(receiptRow.receipt_hash);

    // 4. Enrich receipts with event and delta info
    return receipts.map(receipt => this.enrichReceipt(receipt));
  }

  /**
   * Retrieves traces for a specific event type.
   */
  queryByType(type: string, limit: number = 10): HistoricalTrace[] {
    const rows = this.db.prepare(`
      SELECT r.receipt_hash
      FROM receipts r
      JOIN events e ON r.event_id = e.id
      WHERE e.type = ?
      ORDER BY e.created_at DESC
      LIMIT ?
    `).all(type, limit) as { receipt_hash: string }[];

    return rows.map(row => this.enrichReceipt(this.receiptStore.findByHash(row.receipt_hash)!));
  }

  /**
   * Retrieves a single enriched trace by receipt hash.
   */
  getTrace(receiptHash: string): HistoricalTrace | null {
    const receipt = this.receiptStore.findByHash(receiptHash);
    if (!receipt) return null;
    return this.enrichReceipt(receipt);
  }

  /**
   * Enriches a basic Receipt with its associated event and delta metadata from the database.
   */
  private enrichReceipt(receipt: Receipt): HistoricalTrace {
    const eventRow = this.db.prepare('SELECT id, type, hook_id, created_at FROM events WHERE id = ?').get(receipt.eventId) as any;
    const deltaRow = this.db.prepare('SELECT id, created_at FROM deltas WHERE id = ?').get(receipt.deltaId) as any;

    return {
      receipt,
      event: eventRow ? {
        id: eventRow.id,
        type: eventRow.type,
        hookId: eventRow.hook_id,
        createdAt: eventRow.created_at
      } : undefined,
      delta: deltaRow ? {
        id: deltaRow.id,
        createdAt: deltaRow.created_at
      } : undefined
    };
  }
}
