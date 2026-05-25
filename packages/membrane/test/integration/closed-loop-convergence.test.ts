import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { createDeterministicContext, type TruexContext } from '../../src/context.js';
import { hash } from '../../src/hash.js';
import { createReceipt, verifyReceipt } from '../../src/receipt.js';
import { TruexHook } from '../../src/hook.js';
import { AndonSystem } from '../../src/manufacturing/jidoka.js';
import type { GraphDelta, Quad, HookEffect, HookEvent, Receipt } from '../../src/runtime-law.js';

// Unified Closed-Loop Governor implementation
export class ClosedLoopGovernor {
  private state: Map<string, Quad> = new Map(); // key = subject + ":" + predicate
  public readonly andon = new AndonSystem();
  private hooks: TruexHook[] = [];
  private lastReceiptHash: string | null = null;

  constructor(
    private readonly ctx: TruexContext,
    initialQuads: readonly Quad[] = []
  ) {
    for (const q of initialQuads) {
      const key = `${q.subject}:${q.predicate}`;
      this.state.set(key, q);
    }
  }

  registerHook(hook: TruexHook): void {
    this.hooks.push(hook);
  }

  getState(): Quad[] {
    return [...this.state.values()];
  }

  setLastReceiptHash(hash: string | null): void {
    this.lastReceiptHash = hash;
  }

  getLastReceiptHash(): string | null {
    return this.lastReceiptHash;
  }

  /**
   * Evaluates and applies a proposed GraphDelta.
   * Runs the closed loop:
   * 1. Observe: identify changes.
   * 2. Detect Drift/Violations: check invariants.
   * 3. Stabilize: trigger hooks, apply corrections, or pull Andon cord (Jidoka).
   */
  process(delta: GraphDelta): { status: 'converged' | 'halted'; receipt?: Receipt; error?: string } {
    if (this.andon.isStopped()) {
      return { status: 'halted', error: `Governor halted. Andon reason: ${this.andon.reason}` };
    }

    // Capture state before applying for rollback (TPS standard - Jidoka rollback)
    const backupState = new Map(this.state);

    try {
      // 1. Pre-checks for Jidoka (Pre-PokaYoke)
      // Check for illegal/fossil quads in the incoming delta
      for (const q of [...delta.adds, ...delta.deletes]) {
        if (q.subject.includes('unrepairable') || q.predicate.includes('unrepairable') || q.object.includes('unrepairable')) {
          this.andon.stopLine(`Jidoka Halt: Unrepairable fossil detected in delta: ${q.subject}`, delta.id);
          throw new Error(`Jidoka Halt: Unrepairable fossil detected`);
        }
      }

      // Apply proposed delta to temporary state
      const tempState = new Map(this.state);
      for (const q of delta.deletes) {
        const key = `${q.subject}:${q.predicate}`;
        const existing = tempState.get(key);
        if (existing && existing.object === q.object) {
          tempState.delete(key);
        }
      }
      for (const q of delta.adds) {
        const key = `${q.subject}:${q.predicate}`;
        tempState.set(key, q);
      }

      // 2. Execute matching hooks to perform stabilization
      const triggeredEffects: HookEffect[] = [];
      const triggeredEvents: HookEvent[] = [];

      for (const hook of this.hooks) {
        if (hook.matches(delta)) {
          const execution = hook.execute(this.ctx, delta, this.lastReceiptHash);
          
          if (execution.receipt.status === 'refused') {
            this.andon.stopLine(`Jidoka Halt: Hook ${hook.definition.id} refused transition`, delta.id);
            throw new Error(`Hook refused transition`);
          }

          triggeredEffects.push(...execution.effects);
          triggeredEvents.push(...execution.events);
        }
      }

      // Apply stabilization effects to tempState
      for (const effect of triggeredEffects) {
        if (effect.kind === 'add-quad') {
          const key = `${effect.quad.subject}:${effect.quad.predicate}`;
          tempState.set(key, effect.quad);
        }
      }

      // Clean up remediated repairable fossils
      for (const event of triggeredEvents) {
        if (event.type === 'fossil_remediated') {
          for (const [key, q] of tempState.entries()) {
            if (q.predicate === 'urn:truex:fossil:repairable') {
              tempState.delete(key);
            }
          }
        }
      }

      // 3. Post-execution Invariant Checks (Observe final state posture)
      this.verifyInvariants(tempState, delta.id);

      // If all invariants pass, commit the temporary state
      this.state = tempState;

      // Generate receipt of the closed-loop governance step
      const inputHash = hash(delta);
      const outputHash = hash({
        state: this.getState().sort((a, b) => `${a.subject}:${a.predicate}`.localeCompare(`${b.subject}:${b.predicate}`)),
        effects: triggeredEffects,
        events: triggeredEvents,
      });

      const eventId = triggeredEvents[0]?.id || this.ctx.uuid();
      const receipt = createReceipt(
        this.ctx,
        eventId,
        delta.id,
        inputHash,
        outputHash,
        this.lastReceiptHash,
        'confirmed'
      );

      this.lastReceiptHash = receipt.receiptHash;

      return { status: 'converged', receipt };

    } catch (error_: any) {
      // Rollback on failure/halt (TPS standard - no defective parts downstream)
      this.state = backupState;
      return { status: 'halted', error: error_.message };
    }
  }

  private verifyInvariants(stateMap: Map<string, Quad>, transactionId: string): void {
    const quads = [...stateMap.values()];

    // Invariant 1: No fossil objects in the committed state
    for (const q of quads) {
      if (q.subject.includes('fossil') || q.predicate.includes('fossil') || q.object.includes('fossil')) {
        this.andon.stopLine(`Jidoka Halt: State contains fossil quad: ${q.subject}:${q.predicate}`, transactionId);
        throw new Error(`State contains fossil quad`);
      }
    }

    // Invariant 2: Assignment safety
    const taskAssignments: { task: string; agent: string }[] = [];
    const activeAgents = new Set<string>();
    const terminatedAgents = new Set<string>();

    for (const q of quads) {
      if (q.predicate === 'urn:truex:task:assignedTo') {
        taskAssignments.push({ task: q.subject, agent: q.object });
      } else if (q.predicate === 'urn:truex:agent:status') {
        if (q.object === 'active') {
          activeAgents.add(q.subject);
        } else if (q.object === 'terminated') {
          terminatedAgents.add(q.subject);
        }
      }
    }

    for (const assignment of taskAssignments) {
      if (terminatedAgents.has(assignment.agent) || !activeAgents.has(assignment.agent)) {
        this.andon.stopLine(`Jidoka Halt: Task ${assignment.task} assigned to non-active agent ${assignment.agent}`, transactionId);
        throw new Error(`Task assigned to non-active agent`);
      }
    }

    // Invariant 3: Capacity constraint (max 2 tasks per agent)
    const agentLoad = new Map<string, number>();
    for (const assignment of taskAssignments) {
      const count = (agentLoad.get(assignment.agent) || 0) + 1;
      if (count > 2) {
        this.andon.stopLine(`Jidoka Halt: Capacity breach. Agent ${assignment.agent} assigned ${count} tasks (> 2)`, transactionId);
        throw new Error(`Capacity breach: Agent assigned > 2 tasks`);
      }
      agentLoad.set(assignment.agent, count);
    }
  }

  /**
   * Replays a GraphDelta starting from a clean state and asserts if it produces the expectedReceipt.
   */
  replay(initialStateQuads: Quad[], delta: GraphDelta, expectedReceipt: Receipt): boolean {
    if (!verifyReceipt(expectedReceipt)) {
      return false;
    }

    // Set the governor state to the initial state
    this.state.clear();
    for (const q of initialStateQuads) {
      const key = `${q.subject}:${q.predicate}`;
      this.state.set(key, q);
    }
    this.andon.reset();
    this.lastReceiptHash = expectedReceipt.previousReceiptHash;

    const result = this.process(delta);
    if (result.status !== 'converged' || !result.receipt) {
      return false;
    }

    return result.receipt.receiptHash === expectedReceipt.receiptHash;
  }
}

// Custom stabilization hook for task reassignment
export class TaskReassignmentHook extends TruexHook {
  constructor(
    id: string,
    private readonly getGovernorState: () => Quad[]
  ) {
    super({
      id,
      name: "Auto task reassignment on agent termination",
      condition: { kind: "delta-match", predicate: "urn:truex:agent:status" },
      effects: []
    });
  }

  override execute(ctx: { uuid: () => string }, delta: GraphDelta, previousReceiptHash: string | null | undefined) {
    const state = this.getGovernorState();
    const effects: HookEffect[] = [];

    // Find which agents are being terminated in the delta
    const terminatedAgents = new Set<string>();
    for (const q of delta.adds) {
      if (q.predicate === 'urn:truex:agent:status' && q.object === 'terminated') {
        terminatedAgents.add(q.subject);
      }
    }

    if (terminatedAgents.size > 0) {
      // Find all active agents that are not terminated
      const activeAgents = state
        .filter(q => q.predicate === 'urn:truex:agent:status' && q.object === 'active' && !terminatedAgents.has(q.subject))
        .map(q => q.subject)
        .sort();

      if (activeAgents.length > 0) {
        // Find tasks currently assigned to terminated agents
        const tasksToReassign = state
          .filter(q => q.predicate === 'urn:truex:task:assignedTo' && terminatedAgents.has(q.object))
          .map(q => q.subject);

        // Count current load for active agents
        const agentLoad = new Map<string, number>();
        for (const q of state) {
          if (q.predicate === 'urn:truex:task:assignedTo' && !terminatedAgents.has(q.object)) {
            agentLoad.set(q.object, (agentLoad.get(q.object) || 0) + 1);
          }
        }

        let agentIndex = 0;
        for (const task of tasksToReassign) {
          let assigned = false;
          for (let i = 0; i < activeAgents.length; i++) {
            const idx = (agentIndex + i) % activeAgents.length;
            const agent = activeAgents[idx]!;
            const load = agentLoad.get(agent) || 0;
            if (load < 2) {
              effects.push({
                kind: 'add-quad',
                quad: {
                  subject: task,
                  predicate: 'urn:truex:task:assignedTo',
                  object: agent
                }
              });
              agentLoad.set(agent, load + 1);
              agentIndex = (idx + 1) % activeAgents.length;
              assigned = true;
              break;
            }
          }
          if (!assigned) {
            // No capacity left on active agents. No reassignment generated.
            // This will cause a Jidoka halt in verifyInvariants.
          }
        }
      }
    }

    const events: HookEvent[] = effects.map(() => ({
      id: ctx.uuid(),
      hookId: this.definition.id,
      type: "task_reassigned",
      deltaId: delta.id
    }));

    const inputHash = hash(delta);
    const outputHash = hash({ effects, events });
    const eventId = events[0]?.id || ctx.uuid();
    const receipt = createReceipt(ctx as any, eventId, delta.id, inputHash, outputHash, previousReceiptHash, 'confirmed');

    return { effects, receipt, events };
  }
}

// Custom stabilization hook for repairable fossil remediation
export class FossilRemediationHook extends TruexHook {
  constructor(id: string) {
    super({
      id,
      name: "Auto remediation of repairable fossil indicators",
      condition: { kind: "delta-match", predicate: "urn:truex:fossil:repairable" },
      effects: []
    });
  }

  override execute(ctx: { uuid: () => string }, delta: GraphDelta, previousReceiptHash: string | null | undefined) {
    const effects: HookEffect[] = [];
    for (const q of delta.adds) {
      if (q.predicate === 'urn:truex:fossil:repairable') {
        effects.push({
          kind: 'add-quad',
          quad: {
            subject: q.subject,
            predicate: 'urn:truex:clean:repaired',
            object: q.object.replace('fossil', 'clean')
          }
        });
      }
    }

    const events: HookEvent[] = effects.map(() => ({
      id: ctx.uuid(),
      hookId: this.definition.id,
      type: "fossil_remediated",
      deltaId: delta.id
    }));

    const inputHash = hash(delta);
    const outputHash = hash({ effects, events });
    const eventId = events[0]?.id || ctx.uuid();
    const receipt = createReceipt(ctx as any, eventId, delta.id, inputHash, outputHash, previousReceiptHash, 'confirmed');

    return { effects, receipt, events };
  }
}

// Arbitrary to generate coherent starting states for property testing
const initialSystemStateArb = fc.record({
  numAgents: fc.integer({ min: 2, max: 5 }),
  numTasks: fc.integer({ min: 1, max: 4 }),
  seed: fc.nat(),
}).chain(({ numAgents, numTasks, seed }) => {
  const agentQuads: Quad[] = Array.from({ length: numAgents }, (_, i) => ({
    subject: `urn:truex:agent:${i + 1}`,
    predicate: 'urn:truex:agent:status',
    object: 'active',
    graph: null
  }));

  const taskQuads: Quad[] = [];
  for (let j = 0; j < numTasks; j++) {
    const taskSubject = `urn:truex:task:${j + 1}`;
    const agentIndex = (j % numAgents) + 1;
    taskQuads.push({
      subject: taskSubject,
      predicate: 'urn:truex:task:assignedTo',
      object: `urn:truex:agent:${agentIndex}`,
      graph: null
    });
  }

  return fc.constant({
    quads: [...agentQuads, ...taskQuads],
    numAgents,
    numTasks,
    seed
  });
});

describe('Closed-Loop Governor Convergence & Jidoka', () => {

  it('∀ lawful state and transition: converges successfully and registers valid receipt', () => {
    fc.assert(
      fc.property(
        initialSystemStateArb,
        fc.integer({ min: 1, max: 100 }), // new agent ID suffix
        (initial, newAgentSuffix) => {
          const ctx = createDeterministicContext(initial.seed);
          const governor = new ClosedLoopGovernor(ctx, initial.quads as Quad[]);
          
          const reassignmentHook = new TaskReassignmentHook('hook-reassign', () => governor.getState());
          const fossilHook = new FossilRemediationHook('hook-fossil');
          governor.registerHook(reassignmentHook);
          governor.registerHook(fossilHook);

          // Lawful transition: add a new agent
          const delta: GraphDelta = {
            id: `delta-add-agent-${newAgentSuffix}`,
            adds: [{
              subject: `urn:truex:agent:new-${newAgentSuffix}`,
              predicate: 'urn:truex:agent:status',
              object: 'active',
              graph: null
            }],
            deletes: []
          };

          const result = governor.process(delta);
          expect(result.status).toBe('converged');
          expect(result.receipt).toBeDefined();
          expect(verifyReceipt(result.receipt!)).toBe(true);

          // Verify new agent status is present in governor state
          const state = governor.getState();
          const hasNewAgent = state.some(q => 
            q.subject === `urn:truex:agent:new-${newAgentSuffix}` && 
            q.predicate === 'urn:truex:agent:status' && 
            q.object === 'active'
          );
          expect(hasNewAgent).toBe(true);
        }
      )
    );
  });

  it('∀ state with task assignment: terminating an agent automatically reassigns task if active capacity exists, otherwise halts', () => {
    fc.assert(
      fc.property(
        initialSystemStateArb,
        (initial) => {
          const ctx = createDeterministicContext(initial.seed);
          const governor = new ClosedLoopGovernor(ctx, initial.quads as Quad[]);
          
          const reassignmentHook = new TaskReassignmentHook('hook-reassign', () => governor.getState());
          governor.registerHook(reassignmentHook);

          // Terminate agent 1 (urn:truex:agent:1)
          const delta: GraphDelta = {
            id: 'delta-terminate-agent-1',
            adds: [{
              subject: 'urn:truex:agent:1',
              predicate: 'urn:truex:agent:status',
              object: 'terminated',
              graph: null
            }],
            deletes: [{
              subject: 'urn:truex:agent:1',
              predicate: 'urn:truex:agent:status',
              object: 'active',
              graph: null
            }]
          };

          // Determine capacity of remaining agents before executing
          const remainingAgentsCount = initial.numAgents - 1;
          // Each remaining active agent can take up to 2 tasks.
          const maxCapacity = remainingAgentsCount * 2;
          // Tasks that were assigned to agent 1 need to be reassigned.
          const tasksOnAgent1 = initial.quads.filter(q => 
            q.predicate === 'urn:truex:task:assignedTo' && q.object === 'urn:truex:agent:1'
          );
          const tasksOnOthers = initial.numTasks - tasksOnAgent1.length;
          
          const remainingCapacity = maxCapacity - tasksOnOthers;
          const canAccommodate = tasksOnAgent1.length <= remainingCapacity && remainingAgentsCount > 0;

          const result = governor.process(delta);

          if (canAccommodate) {
            expect(result.status).toBe('converged');
            expect(result.receipt).toBeDefined();
            expect(verifyReceipt(result.receipt!)).toBe(true);

            // In final state, no tasks should be assigned to agent 1
            const finalState = governor.getState();
            const taskOnAgent1InFinal = finalState.some(q => 
              q.predicate === 'urn:truex:task:assignedTo' && q.object === 'urn:truex:agent:1'
            );
            expect(taskOnAgent1InFinal).toBe(false);

            // Agent 1 status should be terminated
            const agent1Status = finalState.find(q => q.subject === 'urn:truex:agent:1' && q.predicate === 'urn:truex:agent:status');
            expect(agent1Status?.object).toBe('terminated');
          } else {
            // Halts line: Jidoka
            expect(result.status).toBe('halted');
            expect(governor.andon.isStopped()).toBe(true);
            
            // State should be rolled back to backupState
            const finalState = governor.getState();
            expect(finalState.length).toBe(initial.quads.length);
            // Verify that agent 1 remains active
            const agent1Status = finalState.find(q => q.subject === 'urn:truex:agent:1' && q.predicate === 'urn:truex:agent:status');
            expect(agent1Status?.object).toBe('active');
          }
        }
      )
    );
  });

  it('∀ unlawful state transition: triggers Jidoka Halt (Andon stop) and rolls back state', () => {
    fc.assert(
      fc.property(
        initialSystemStateArb,
        fc.oneof(
          // Option A: Unrepairable fossil in delta
          fc.constant({
            kind: 'fossil' as const,
            delta: {
              id: 'delta-unlawful-fossil',
              adds: [{
                subject: 'urn:truex:fossil:unrepairable-1',
                predicate: 'urn:truex:fossil:unrepairable',
                object: 'fossil',
                graph: null
              }],
              deletes: []
            }
          }),
          // Option B: Exceed capacity (assign task to agent such that it has 3 tasks)
          fc.constant({
            kind: 'capacity' as const,
            delta: {
              id: 'delta-unlawful-capacity',
              adds: [{
                subject: 'urn:truex:task:new-capacity-task',
                predicate: 'urn:truex:task:assignedTo',
                object: 'urn:truex:agent:1',
                graph: null
              }, {
                subject: 'urn:truex:task:new-capacity-task-2',
                predicate: 'urn:truex:task:assignedTo',
                object: 'urn:truex:agent:1',
                graph: null
              }],
              deletes: []
            }
          })
        ),
        (initial, violation) => {
          const ctx = createDeterministicContext(initial.seed);
          const governor = new ClosedLoopGovernor(ctx, initial.quads as Quad[]);
          const reassignmentHook = new TaskReassignmentHook('hook-reassign', () => governor.getState());
          governor.registerHook(reassignmentHook);

          const result = governor.process(violation.delta as unknown as GraphDelta);

          expect(result.status).toBe('halted');
          expect(governor.andon.isStopped()).toBe(true);

          // Invariant: Rollback preserves initial state
          const state = governor.getState();
          expect(state.length).toBe(initial.quads.length);
          for (const q of initial.quads) {
            const match = state.find(sq => sq.subject === q.subject && sq.predicate === q.predicate && sq.object === q.object);
            expect(match).toBeDefined();
          }
        }
      )
    );
  });

  it('∀ repairable fossil: FossilRemediationHook converges state and removes fossil from state', () => {
    fc.assert(
      fc.property(
        initialSystemStateArb,
        (initial) => {
          const ctx = createDeterministicContext(initial.seed);
          const governor = new ClosedLoopGovernor(ctx, initial.quads as Quad[]);
          const fossilHook = new FossilRemediationHook('hook-fossil');
          governor.registerHook(fossilHook);

          const delta: GraphDelta = {
            id: 'delta-repairable-fossil',
            adds: [{
              subject: 'urn:truex:repaired-item',
              predicate: 'urn:truex:fossil:repairable',
              object: 'fossil-value',
              graph: null
            }],
            deletes: []
          };

          const result = governor.process(delta);

          expect(result.status).toBe('converged');
          expect(governor.andon.isStopped()).toBe(false);

          // State should NOT contain the fossil quad, but should contain the repaired quad
          const state = governor.getState();
          const containsFossil = state.some(q => q.predicate === 'urn:truex:fossil:repairable');
          expect(containsFossil).toBe(false);

          const repairedQuad = state.find(q => q.subject === 'urn:truex:repaired-item' && q.predicate === 'urn:truex:clean:repaired');
          expect(repairedQuad).toBeDefined();
          expect(repairedQuad?.object).toBe('clean-value');
        }
      )
    );
  });

  it('∀ successful transition: replay convergence succeeds, and tampering causes failure', () => {
    fc.assert(
      fc.property(
        initialSystemStateArb,
        (initial) => {
          const ctx = createDeterministicContext(initial.seed);
          const governor = new ClosedLoopGovernor(ctx, initial.quads as Quad[]);
          const reassignmentHook = new TaskReassignmentHook('hook-reassign', () => governor.getState());
          governor.registerHook(reassignmentHook);

          const delta: GraphDelta = {
            id: 'delta-add-agent',
            adds: [{
              subject: 'urn:truex:agent:new-agent-replay',
              predicate: 'urn:truex:agent:status',
              object: 'active',
              graph: null
            }],
            deletes: []
          };

          const result = governor.process(delta);
          expect(result.status).toBe('converged');
          const receipt = result.receipt!;

          // Verify replay succeeds
          const replayCtx = createDeterministicContext(initial.seed);
          const replayGovernor = new ClosedLoopGovernor(replayCtx, initial.quads);
          const replayReassignmentHook = new TaskReassignmentHook('hook-reassign', () => replayGovernor.getState());
          replayGovernor.registerHook(replayReassignmentHook);
          
          const replaySucceeded = replayGovernor.replay(initial.quads as Quad[], delta, receipt);
          expect(replaySucceeded).toBe(true);

          // Verify tampering with receipt status causes replay to fail
          const tamperedReceipt1: Receipt = { ...receipt, status: 'refused' };
          const replayTampered1 = replayGovernor.replay(initial.quads as Quad[], delta, tamperedReceipt1);
          expect(replayTampered1).toBe(false);

          // Verify tampering with receipt hash causes replay to fail
          const tamperedReceipt2: Receipt = { ...receipt, receiptHash: receipt.receiptHash + '_tampered' };
          const replayTampered2 = replayGovernor.replay(initial.quads as unknown as Quad[], delta, tamperedReceipt2);
          expect(replayTampered2).toBe(false);
        }
      )
    );
  });
});
