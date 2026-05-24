/**
 * @module receipt-store
 * @description SQLite-backed store for persisting and verifying receipts.
 * Gall Classification: S0 (receipt primitives) / S3 (sqlite membrane primitives).
 * Enforces the receipt law and tamper detection.
 */
import type { Database } from 'better-sqlite3';
import type { Receipt } from '../runtime-law.js';
import { verifyReceipt } from '../receipt.js';

/**
 * SQLite implementation of ReceiptStore.
 * Provides persistence and integrity verification for receipts.
 */
export class SQLiteReceiptStore {
  constructor(private db: Database) {}

  /**
   * Maps a database row to a Receipt object.
   */
  private mapRowToReceipt(row: any): Receipt {
    return {
      id: row.id,
      eventId: row.event_id,
      deltaId: row.delta_id,
      inputHash: row.input_hash,
      outputHash: row.output_hash,
      previousReceiptHash: row.previous_receipt_hash,
      status: row.status as 'confirmed' | 'refused',
      receiptHash: row.receipt_hash,
    };
  }

  /**
   * Retrieves the latest receipt from the store.
   * Performs hash verification on read.
   */
  latest(): Receipt | null {
    const row = this.db.prepare('SELECT * FROM receipts ORDER BY rowid DESC LIMIT 1').get() as any;
    if (!row) return null;

    const receipt = this.mapRowToReceipt(row);
    if (!verifyReceipt(receipt)) {
      throw new Error(`Receipt integrity check failed for latest receipt ${receipt.id}`);
    }

    return receipt;
  }

  /**
   * Retrieves a receipt by its ID.
   * Performs hash verification on read.
   */
  read(id: string): Receipt | null {
    return this.findById(id);
  }

  /**
   * Finds a receipt by its ID.
   * Performs hash verification on read.
   */
  findById(id: string): Receipt | null {
    const row = this.db.prepare('SELECT * FROM receipts WHERE id = ?').get(id) as any;
    if (!row) return null;

    const receipt = this.mapRowToReceipt(row);
    if (!verifyReceipt(receipt)) {
      throw new Error(`Receipt integrity check failed for receipt ${id}`);
    }

    return receipt;
  }

  /**
   * Appends a new receipt to the store.
   * Verifies the receipt hash before storing.
   */
  append(receipt: Receipt): void {
    if (!verifyReceipt(receipt)) {
      throw new Error(`Cannot append invalid receipt ${receipt.id}`);
    }

    this.db.prepare(`
      INSERT OR REPLACE INTO receipts (
        id, event_id, delta_id, input_hash, output_hash, previous_receipt_hash, status, receipt_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      receipt.id,
      receipt.eventId,
      receipt.deltaId,
      receipt.inputHash,
      receipt.outputHash,
      receipt.previousReceiptHash,
      receipt.status,
      receipt.receiptHash
    );
  }

  /**
   * Retrieves all receipts in the store.
   * Performs hash verification for each receipt.
   */
  all(): Receipt[] {
    const rows = this.db.prepare('SELECT * FROM receipts ORDER BY rowid ASC').all() as any[];
    return rows.map((row) => {
      const receipt = this.mapRowToReceipt(row);
      if (!verifyReceipt(receipt)) {
        throw new Error(`Receipt integrity check failed for receipt ${receipt.id} in all()`);
      }
      return receipt;
    });
  }

  /**
   * Finds a receipt by its unique hash.
   */
  findByHash(hash: string): Receipt | null {
    const row = this.db.prepare('SELECT * FROM receipts WHERE receipt_hash = ?').get(hash) as any;
    if (!row) return null;

    const receipt = this.mapRowToReceipt(row);
    if (!verifyReceipt(receipt)) {
      throw new Error(`Receipt integrity check failed for receipt with hash ${hash}`);
    }

    return receipt;
  }
}
