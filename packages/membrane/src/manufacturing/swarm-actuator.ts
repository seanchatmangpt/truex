/**
 * @module swarm-actuator
 * @description Gall S₂: Engine primitives.
 * Implements SwarmActuator for autonomous resolution of line abnormalities.
 */
import type { DashboardMetrics } from './visual.js';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { type TruexContext, createDeterministicContext } from '../context.js';
import { type SwarmReceipt, generateSwarmReceipt } from './swarm-receipt.js';
import type { ReceiptHash } from '../ocel2-project-types.js';

/**
 * ActuationProposal represents a suggested action to be taken by the swarm
 * to maintain or restore the health of the production line.
 */
export interface ActuationProposal {
  id: string;
  type: 'Launch Auditor Subagent' | string;
  reason: string;
  confidence: number;
  timestamp: string;
  metadata?: Record<string, any>;
  receiptHash?: ReceiptHash;
}

/**
 * SwarmActuator (Subagent Orchestrator).
 * 
 * In the Toyota Production System (TPS), when an abnormality is detected (Jidoka),
 * the system must act to resolve it. The SwarmActuator proposes high-level
 * orchestrations, such as launching specialized subagents, to address
 * performance or quality issues.
 * 
 * It also maintains a cryptographically linked SwarmReceipt chain for all
 * agent-to-agent delegations (A2A) to ensure total causal accountability.
 */
export class SwarmActuator {
  private proposals: ActuationProposal[] = [];
  private receipts: SwarmReceipt[] = [];
  private lastReceiptHash?: ReceiptHash;
  
  private readonly outputPath = path.join(process.cwd(), 'docs', 'v1', 'latest', 'actuations', 'swarm.json');
  private readonly receiptsPath = path.join(process.cwd(), 'docs', 'v1', 'latest', 'actuations', 'receipts.json');
  private readonly ctx: TruexContext;

  constructor(ctx?: TruexContext) {
    this.ctx = ctx || createDeterministicContext(999);
    this.loadHistory();
  }

  /**
   * Loads existing proposals and receipts to maintain the causal chain.
   */
  private loadHistory(): void {
    if (fs.existsSync(this.receiptsPath)) {
      try {
        const content = fs.readFileSync(this.receiptsPath, 'utf8');
        this.receipts = JSON.parse(content) as SwarmReceipt[];
        if (this.receipts.length > 0) {
          this.lastReceiptHash = this.receipts[this.receipts.length - 1].receiptHash;
        }
      } catch {
        // Ignore load errors
      }
    }
  }

  /**
   * Records a formal agent-to-agent delegation actuation with a cryptographic receipt.
   * 
   * @param delegator The agent initiating the delegation.
   * @param delegatee The agent being invoked.
   * @param action The specific command or action requested.
   * @param confidence The confidence level of the delegation.
   * @param metadata Optional context metadata.
   * @returns The generated SwarmReceipt.
   */
  recordActuation(
    delegator: string,
    delegatee: string,
    action: string,
    confidence: number,
    metadata?: Record<string, any>
  ): SwarmReceipt {
    const receipt = generateSwarmReceipt(
      delegator,
      delegatee,
      action,
      confidence,
      this.lastReceiptHash,
      metadata
    );

    this.receipts.push(receipt);
    this.lastReceiptHash = receipt.receiptHash;
    this.flush();
    
    return receipt;
  }

  /**
   * Evaluates the current metrics and generates actuation proposals if necessary.
   * 
   * @param metrics The current metrics from the manufacturing dashboard.
   * @returns An array of new actuation proposals generated during this evaluation.
   */
  evaluate(metrics: DashboardMetrics): ActuationProposal[] {
    const newProposals: ActuationProposal[] = [];

    if (metrics.convergenceRate < 0.95) {
      const id = `act-auditor-${this.ctx.clock()}-${this.ctx.uuid().slice(0, 8)}`;
      newProposals.push({
        id,
        type: 'Launch Auditor Subagent',
        reason: `Convergence rate (${(metrics.convergenceRate * 100).toFixed(1)}%) dropped below threshold (95.0%).`,
        confidence: 1,
        timestamp: new Date(this.ctx.clock()).toISOString(),
        metadata: {
          convergenceRate: metrics.convergenceRate,
          threshold: 0.95
        }
      });
    }

    if (newProposals.length > 0) {
      this.proposals.push(...newProposals);
      this.flush();
    }

    return newProposals;
  }

  /**
   * Flushes the proposals and receipts to their respective output files.
   */
  private flush(): void {
    try {
      const dir = path.dirname(this.outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Flush proposals
      let allProposals = this.proposals;
      if (fs.existsSync(this.outputPath)) {
        try {
          const content = fs.readFileSync(this.outputPath, 'utf8');
          const existing = JSON.parse(content) as ActuationProposal[];
          const existingIds = new Set(existing.map(p => p.id));
          allProposals = [...existing, ...this.proposals.filter(p => !existingIds.has(p.id))];
        } catch { }
      }
      fs.writeFileSync(this.outputPath, JSON.stringify(allProposals, null, 2), 'utf-8');

      // Flush receipts
      fs.writeFileSync(this.receiptsPath, JSON.stringify(this.receipts, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to flush swarm data:', error);
    }
  }

  /**
   * Returns all generated proposals.
   */
  getProposals(): ActuationProposal[] {
    return this.proposals;
  }

  /**
   * Returns the entire receipt chain.
   */
  getReceipts(): SwarmReceipt[] {
    return this.receipts;
  }

  /**
   * Clears the current session's proposals and receipts.
   */
  clear(): void {
    this.proposals = [];
    this.receipts = [];
    this.lastReceiptHash = undefined;
  }
}
