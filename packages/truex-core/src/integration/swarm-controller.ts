import { hash } from "../hash.js";
import type { TruexContext } from "../context.js";

/**
 * Interface representing a subagent in the active swarm topology.
 */
export interface ActiveAgent {
  id: string;
  parentAgentId?: string | null;
  role: string;
  taskDesc?: string | null;
  status: 'active' | 'terminated';
  metrics: {
    convergenceRate?: number;
    errorRate?: number;
    driftScore?: number; // 0 to 1
    lastActiveTimestamp?: number;
    consecutiveFailures?: number;
    [key: string]: any;
  };
  metadata?: Record<string, any>;
}

/**
 * Policy definition to identify drifted/deviated agents.
 */
export interface DriftPolicy {
  maxDriftScore?: number;
  minConvergenceRate?: number;
  maxErrorRate?: number;
  maxConsecutiveFailures?: number;
  customRule?: (agent: ActiveAgent) => boolean;
}

/**
 * Task structure to be managed and rebalanced.
 */
export interface SwarmTask {
  id: string;
  description: string;
  roleRequired?: string | null;
  priority?: number; // Higher numbers indicate higher priority
  assignedAgentId?: string | null;
  status?: 'pending' | 'assigned' | 'completed' | 'failed';
  metadata?: Record<string, any>;
}

/**
 * Result returned by terminateDriftedAgents.
 */
export interface TerminationResult {
  terminatedAgentIds: string[];
  updatedAgents: ActiveAgent[];
}

/**
 * Result returned by rebalanceTasks.
 */
export interface RebalanceResult {
  rebalancedTasks: SwarmTask[];
  updatedAgents: ActiveAgent[];
}

/**
 * Launches an auditor agent by generating a simulated spawned agent ID.
 * Returns a simulated spawned agent ID.
 * Optionally uses the deterministic context if provided, otherwise hashes inputs.
 * 
 * @param parentAgentId The ID of the parent agent triggering this launch.
 * @param taskDesc Description of the audit task.
 * @param context Optional deterministic context for ID generation.
 */
export function launchAuditor(
  parentAgentId: string,
  taskDesc: string,
  context?: TruexContext
): string {
  if (!parentAgentId) {
    throw new Error("parentAgentId is required to launch auditor");
  }
  if (!taskDesc) {
    throw new Error("taskDesc is required to launch auditor");
  }

  if (context && typeof context.uuid === 'function') {
    return `agent-auditor-${context.uuid()}`;
  }

  const idSuffix = hash({ parentAgentId, taskDesc }).slice(0, 16);
  return `agent-auditor-${idSuffix}`;
}

/**
 * Evaluates active agents against a drift policy and terminates those that deviate.
 * Does not modify activeAgents array in place, instead returns a new array.
 * 
 * @param activeAgents The current list of active subagents.
 * @param policy The policy defining drift thresholds.
 */
export function terminateDriftedAgents(
  activeAgents: ActiveAgent[],
  policy: DriftPolicy
): TerminationResult {
  const terminatedAgentIds: string[] = [];
  const updatedAgents: ActiveAgent[] = activeAgents.map((agent) => {
    // Clone agent to avoid mutations
    const agentCopy: ActiveAgent = {
      ...agent,
      metrics: { ...agent.metrics },
      metadata: agent.metadata ? { ...agent.metadata } : undefined,
    };

    if (agentCopy.status === 'terminated') {
      return agentCopy;
    }

    let shouldTerminate = false;

    // Evaluate maxDriftScore
    if (
      policy.maxDriftScore !== undefined &&
      agentCopy.metrics.driftScore !== undefined &&
      agentCopy.metrics.driftScore > policy.maxDriftScore
    ) {
      shouldTerminate = true;
    }

    // Evaluate minConvergenceRate
    if (
      policy.minConvergenceRate !== undefined &&
      agentCopy.metrics.convergenceRate !== undefined &&
      agentCopy.metrics.convergenceRate < policy.minConvergenceRate
    ) {
      shouldTerminate = true;
    }

    // Evaluate maxErrorRate
    if (
      policy.maxErrorRate !== undefined &&
      agentCopy.metrics.errorRate !== undefined &&
      agentCopy.metrics.errorRate > policy.maxErrorRate
    ) {
      shouldTerminate = true;
    }

    // Evaluate maxConsecutiveFailures
    if (
      policy.maxConsecutiveFailures !== undefined &&
      agentCopy.metrics.consecutiveFailures !== undefined &&
      agentCopy.metrics.consecutiveFailures > policy.maxConsecutiveFailures
    ) {
      shouldTerminate = true;
    }

    // Evaluate customRule
    if (policy.customRule && policy.customRule(agentCopy)) {
      shouldTerminate = true;
    }

    if (shouldTerminate) {
      agentCopy.status = 'terminated';
      terminatedAgentIds.push(agentCopy.id);
    }

    return agentCopy;
  });

  return {
    terminatedAgentIds,
    updatedAgents,
  };
}

/**
 * Rebalances tasks in the queue among the active agents.
 * 1. Tasks assigned to terminated agents are unassigned.
 * 2. Unassigned/pending tasks are assigned to eligible active agents.
 * 3. Sorting and assignment are deterministic (e.g. by priority, task ID, agent ID) to ensure replay convergence.
 * 
 * @param taskQueue List of tasks in the swarm.
 * @param activeAgents Current list of active agents (some of which may be terminated).
 */
export function rebalanceTasks(
  taskQueue: SwarmTask[],
  activeAgents: ActiveAgent[]
): RebalanceResult {
  // Clone agents to avoid mutations
  const updatedAgents: ActiveAgent[] = activeAgents.map((agent) => ({
    ...agent,
    metrics: { ...agent.metrics },
    metadata: agent.metadata ? { ...agent.metadata } : undefined,
  }));

  // Identify active (non-terminated) agents
  const eligibleAgents = updatedAgents.filter((agent) => agent.status === 'active');
  const eligibleAgentIds = new Set(eligibleAgents.map((a) => a.id));

  // Clone tasks and release assignments of terminated/unavailable agents
  const rebalancedTasks: SwarmTask[] = taskQueue.map((task) => {
    const taskCopy: SwarmTask = {
      ...task,
      metadata: task.metadata ? { ...task.metadata } : undefined,
    };

    if (taskCopy.assignedAgentId && !eligibleAgentIds.has(taskCopy.assignedAgentId)) {
      taskCopy.assignedAgentId = null;
      if (taskCopy.status === 'assigned') {
        taskCopy.status = 'pending';
      }
    }

    return taskCopy;
  });

  // Collect tasks that need assignment (assignedAgentId is null/undefined or status is pending)
  const tasksToAssign = rebalancedTasks.filter(
    (t) => !t.assignedAgentId && t.status !== 'completed' && t.status !== 'failed'
  );

  // Deterministically sort tasks to assign: priority DESC, then ID ASC
  tasksToAssign.sort((a, b) => {
    const priorityA = a.priority ?? 0;
    const priorityB = b.priority ?? 0;
    if (priorityB !== priorityA) {
      return priorityB - priorityA;
    }
    return a.id.localeCompare(b.id);
  });

  // Assign each task to the eligible agent with the lowest load (number of tasks assigned).
  // If there's a tie, break it using agent ID alphabetically.
  for (const task of tasksToAssign) {
    // Filter agents by role requirement
    const matchingAgents = eligibleAgents.filter((agent) => {
      if (!task.roleRequired) return true;
      return agent.role.toLowerCase() === task.roleRequired.toLowerCase();
    });

    if (matchingAgents.length === 0) {
      continue; // No eligible agent can perform this task
    }

    // Determine current task counts for each matching agent from rebalancedTasks
    const agentLoads: Record<string, number> = {};
    for (const agent of matchingAgents) {
      agentLoads[agent.id] = 0;
    }

    for (const t of rebalancedTasks) {
      const assignedId = t.assignedAgentId;
      if (assignedId && agentLoads[assignedId] !== undefined) {
        agentLoads[assignedId] = (agentLoads[assignedId] ?? 0) + 1;
      }
    }

    // Sort matching agents by current load ASC, then agent ID ASC for determinism
    matchingAgents.sort((a, b) => {
      const loadA = agentLoads[a.id]!;
      const loadB = agentLoads[b.id]!;
      if (loadA !== loadB) {
        return loadA - loadB;
      }
      return a.id.localeCompare(b.id);
    });

    const chosenAgent = matchingAgents[0]!;
    task.assignedAgentId = chosenAgent.id;
    task.status = 'assigned';

    // Update agent's current task description to reflect assignment
    const agentInUpdatedList = updatedAgents.find((a) => a.id === chosenAgent.id);
    if (agentInUpdatedList) {
      agentInUpdatedList.taskDesc = task.description;
    }
  }

  // For any agent that no longer has any assigned tasks, clear their taskDesc
  for (const agent of updatedAgents) {
    if (agent.status === 'active') {
      const hasTask = rebalancedTasks.some((t) => t.assignedAgentId === agent.id);
      if (!hasTask) {
        agent.taskDesc = null;
      }
    }
  }

  return {
    rebalancedTasks,
    updatedAgents,
  };
}
