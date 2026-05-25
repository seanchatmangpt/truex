
import Database from 'better-sqlite3';
import { SQLiteReceiptStore } from './packages/membrane/src/persistence/receipt-store.js';
import { initializeSchema } from './packages/membrane/src/persistence/schema.js';
import { createDeterministicContext } from './packages/membrane/src/context.js';
import { createReceipt } from './skills/receipt/mutations.ts';
import { hash } from './skills/receipt/mutations.ts';

async function run() {
  const db = new Database('tamper_test.db');
  initializeSchema(db);
  const store = new SQLiteReceiptStore(db);
  const ctx = createDeterministicContext(42);

  console.log("Creating valid chain...");
  const r1 = createReceipt(ctx, "evt-1", "delta-1", "input-1", "output-1", null);
  store.append(r1);

  const r2 = createReceipt(ctx, "evt-2", "delta-2", "input-2", "output-2", r1.receiptHash);
  store.append(r2);

  console.log("Initial verify (store.all()):");
  try {
    store.all();
    console.log("✅ Store all() passed");
  } catch (e) {
    console.error("❌ Store all() failed:", e.message);
  }

  console.log("\nTampering with R1 (payload and hash)...");
  // We change output-1 to output-tampered and update receiptHash so it's individually valid
  const r1Tampered = { ...r1, outputHash: "output-tampered" };
  // Re-calculate hash
  const { receiptHash, signature, publicKey, ...receiptWithoutHash } = r1Tampered;
  const cleanReceiptWithoutHash = { ...receiptWithoutHash };
  for (const key of Object.keys(cleanReceiptWithoutHash)) {
      if ((cleanReceiptWithoutHash as any)[key] === undefined) {
        delete (cleanReceiptWithoutHash as any)[key];
      }
  }
  const newHash = hash(cleanReceiptWithoutHash);
  
  db.prepare('UPDATE receipts SET output_hash = ?, receipt_hash = ? WHERE id = ?').run(
    "output-tampered",
    newHash,
    r1.id
  );

  console.log("Verifying after tamper (store.all()):");
  try {
    const all = store.all();
    console.log("✅ Store all() passed (THIS IS THE GAP - it should have failed because R2 still points to the old R1 hash)");
    console.log("R2 previousReceiptHash:", all[1].previousReceiptHash);
    console.log("R1 new receiptHash:", all[0].receiptHash);
    if (all[1].previousReceiptHash !== all[0].receiptHash) {
        console.log("⚠️ CHAIN IS BROKEN but all() didn't notice.");
    }
  } catch (e) {
    console.log("🛑 Store all() detected tampering (GOOD):", e.message);
  }
}

run();
