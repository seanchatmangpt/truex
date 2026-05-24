/**
 * @module swarm-actuator
 * @description Gall S₂: Engine primitives.
 * Implements SwarmActuator for autonomous resolution of line abnormalities.
 */
import type { DashboardMetrics } from './visual.js';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { type TruexContext, createDeterministicContext } from '../context.js';

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
}

/**
 * SwarmActuator (Subagent Orchestrator).
 * 
 * In the Toyota Production System (TPS), when an abnormality is detected (Jidoka),
 * the system must act to resolve it. The SwarmActuator proposes high-level
 * orchestrations, such as launching specialized subagents, to address
 * performance or quality issues.
 */
export class SwarmActuator {
  private proposals: ActuationProposal[] = [];
  private readonly outputPath = path.join(process.cwd(), 'docs', 'v1', 'latest', 'actuations', 'swarm.json');
  private readonly ctx: TruexContext;

  constructor(ctx?: TruexContext) {
    this.ctx = ctx || createDeterministicContext(999);
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
      const id = `act-auditor-${this.ctx.clock()}-${this.ctx.uuid().substring(0, 8)}`;
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
   * Flushes the proposals to the output file.
   */
  private flush(): void {
    try {
      const dir = path.dirname(this.outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Load existing proposals if file exists to maintain history
      let allProposals = this.proposals;
      if (fs.existsSync(this.outputPath)) {
        try {
          const content = fs.readFileSync(this.outputPath, 'utf8');
          const existing = JSON.parse(content) as ActuationProposal[];
          // Merge and avoid duplicates by ID
          const existingIds = new Set(existing.map(p => p.id));
          allProposals = [...existing, ...this.proposals.filter(p => !existingIds.has(p.id))];
        } catch {
          // If file is corrupt, we'll just overwrite with current proposals
        }
      }

      fs.writeFileSync(this.outputPath, JSON.stringify(allProposals, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to flush swarm actuation proposals:', error);
    }
  }

  /**
   * Returns all generated proposals.
   */
  getProposals(): ActuationProposal[] {
    return this.proposals;
  }

  /**
   * Clears the current session's proposals.
   */
  clear(): void {
    this.proposals = [];
  }
}
