/**
 * @module project-receipts
 * @description
 * Gall Classification: S11 Wizard Boundary
 * Purpose: Defines the receipt payload structure required for durable project motion.
 */

export interface WizardReceipt {
  receipt_id: string;
  verb: string;
  project_cell_id: string;
  attempt_id: string;
  decision_id: string;
  parent_receipt_hash: string | null;
  input_hash: string;
  output_hash: string;
  project_root_hash_before: string;
  project_root_hash_after: string;
  mailbox_transition_id: string | null;
  replay_fixture_id: string | null;
  accounting_entry_id: string | null;
  created_at_monotonic: number;
}
