/**
 * @module jidoka
 * @description Gall S₂: Engine primitives.
 * Implements AndonSystem and PokaYoke for Autonomation and Error-proofing.
 */
import type { GraphDelta, HookDefinition, Receipt, HookEvent, HookEffect } from '../runtime-law.js';
import { TruexHook } from '../hook.js';
import type { TruexContext } from '../context.js';
import { WorkStandards } from './standardization.js';

/**
 * Jidoka (Autonomation / Poka-yoke).
 *
 * Reference: Toyota Production System (TPS).
 *
 * Jidoka provides machines and operators the ability to detect when an abnormal
 * condition has occurred and immediately stop work. This prevents the production
 * of defective products and ensures quality at the source.
 */

/**
 * Andon (Signaling System) for the Production Line.
 * When a problem occurs, the 'cord' is pulled, triggering a 'Line Stop'
 * to prevent defects from moving downstream.
 */
export class AndonSystem {
  private lineStopped: boolean = false;
  private stopReason: string | null = null;
  private activeTransactionId: string | null = null;
  private chainId: string | null = null;
  private chainTransactions: string[] = [];

  /**
   * Starts a new hook chain.
   *
   * @param chainId Unique identifier for the hook chain.
   */
  startChain(chainId: string): void {
    this.chainId = chainId;
    this.chainTransactions = [];
  }

  /**
   * Triggers a 'Line Stop' (Andon).
   *
   * @param reason The reason for stopping the line.
   * @param transactionId The ID of the transaction that triggered the stop.
   */
  stopLine(reason: string, transactionId?: string): void {
    this.lineStopped = true;
    this.stopReason = reason;
    this.activeTransactionId = transactionId || null;
    
    if (transactionId) {
      this.chainTransactions.push(transactionId);
    }
  }

  /**
   * Checks if the line is currently stopped for a specific transaction or chain.
   */
  isStopped(transactionId?: string): boolean {
    if (!this.lineStopped) return false;
    
    // If no transactionId is provided, any stop counts as a line stop.
    if (!transactionId) return this.lineStopped;

    // If it's the exact transaction that stopped the line
    if (this.activeTransactionId === transactionId) return true;

    // If the transaction is part of the current stopped chain
    return this.chainTransactions.includes(transactionId);
  }

  /**
   * Resets the Andon signal, allowing production to resume.
   */
  reset(): void {
    this.lineStopped = false;
    this.stopReason = null;
    this.activeTransactionId = null;
    this.chainId = null;
    this.chainTransactions = [];
  }

  /**
   * Returns the reason for the current line stop.
   */
  get reason(): string | null {
    return this.stopReason;
  }

  /**
   * Returns the current active chain ID.
   */
  get activeChainId(): string | null {
    return this.chainId;
  }
}

/**
 * Poka-yoke (Error-proofing) mechanism.
 *
 * Poka-yoke is any mechanism in a Lean manufacturing process that helps
 * an equipment operator avoid (yokeru) mistakes (poka). Its purpose is
 * to eliminate product defects by preventing, correcting, or drawing
 * attention to human errors as they occur.
 */
export class PokaYoke {
  constructor(private readonly andon: AndonSystem) {}

  /**
   * Wraps a hook's execution with error-proofing logic.
   * Validates inputs against semantic laws and detects divergence.
   *
   * @param hook The hook to be guarded.
   * @param ctx The execution context.
   * @param delta The input delta for the hook.
   * @param executeFn The underlying execution logic.
   * @param transactionId The ID of the current transaction.
   */
  guardExecution(
    hook: TruexHook,
    ctx: TruexContext,
    delta: GraphDelta,
    executeFn: () => { effects: HookEffect[]; receipt: Receipt; events: HookEvent[] },
    transactionId?: string
  ): { effects: HookEffect[]; receipt: Receipt; events: HookEvent[] } {
    // 1. Check if the line is already stopped for this transaction
    if (this.andon.isStopped(transactionId)) {
      throw new Error(
        `Jidoka LineStop: Hook execution blocked for transaction ${transactionId}. Reason: ${this.andon.reason}`
      );
    }

    // 2. Pre-execution Poka-yoke: Validate inputs against "Semantic Laws"
    try {
      this.validateSemanticLaws(hook.definition, delta);
    } catch (error_: any) {
      this.andon.stopLine(`Poka-yoke Pre-Check Failure: ${error_.message}`, transactionId);
      throw error_;
    }

    // 3. Execution with failure detection
    try {
      const result = executeFn();

      // 4. Post-execution Poka-yoke: Divergence detection
      if (result.receipt.status === 'refused') {
        const reason = `Jidoka Divergence: Hook ${hook.definition.id} produced a 'refused' receipt status.`;
        this.andon.stopLine(reason, transactionId);
        throw new Error(reason);
      }

      return result;
    } catch (error_: any) {
      // If execution fails, we pull the Andon cord
      if (!this.andon.isStopped(transactionId)) {
        this.andon.stopLine(`Execution Error in hook ${hook.definition.id}: ${error_.message}`, transactionId);
      }
      throw error_;
    }
  }

  /**
   * Validates the hook and delta against semantic laws.
   * This ensures that the 'parts' (data) entering the process are not defective.
   */
  private validateSemanticLaws(definition: HookDefinition, delta: GraphDelta): void {
    // Law 1: Structural Integrity (via standardization)
    try {
      WorkStandards.ReflexPatterns.enforce(definition);
    } catch (error_: any) {
      throw new Error(`Semantic Law Violation (Standardization): ${error_.message}`);
    }

    // Law 2: Delta Validity
    if (!delta.id || typeof delta.id !== 'string') {
      throw new Error("Semantic Law Violation: GraphDelta lacks a valid ID.");
    }

    // Law 3: Relevance Check (Muda detection)
    // If the hook is being called for a delta it doesn't match, it's a process error.
    const hasMatch = definition.condition.kind === 'always' || 
      delta.adds.some(q => q.predicate === (definition.condition as any).predicate) ||
      delta.deletes.some(q => q.predicate === (definition.condition as any).predicate);
    
    if (!hasMatch) {
      throw new Error(`Semantic Law Violation: Hook ${definition.id} does not match Delta ${delta.id}.`);
    }

    // Law 4: Input Capacity (Muri detection)
    if (delta.adds.length + delta.deletes.length > 100) {
       throw new Error("Semantic Law Violation (Muri): Input delta size exceeds processing capacity.");
    }
  }
}
