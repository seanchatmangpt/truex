import { describe, it, expect } from "vitest";
import {
  launchAuditor,
  terminateDriftedAgents,
  rebalanceTasks,
  type ActiveAgent,
  type DriftPolicy,
  type SwarmTask
} from "../../src/integration/swarm-controller.js";
import { createDeterministicContext } from "../../src/context.js";

describe("S2 Swarm Consequence Controller Integration Tests", () => {

  describe("launchAuditor", () => {
    it("generates a deterministic simulated agent ID without context", () => {
      const parentId = "agent-parent-123";
      const desc = "Audit access control and sandbox boundary integrity";

      const id1 = launchAuditor(parentId, desc);
      const id2 = launchAuditor(parentId, desc);

      expect(id1).toBe(id2);
      expect(id1).toMatch(/^agent-auditor-[a-f0-9]{16}$/);
    });

    it("generates a unique but context-deterministic agent ID with TruexContext", () => {
      const parentId = "agent-parent-123";
      const desc = "Audit access control and sandbox boundary integrity";

      const context1 = createDeterministicContext(42);
      const context2 = createDeterministicContext(42);
      const context3 = createDeterministicContext(999);

      const id1 = launchAuditor(parentId, desc, context1);
      const id2 = launchAuditor(parentId, desc, context2);
      const id3 = launchAuditor(parentId, desc, context3);

      expect(id1).toBe(id2);
      expect(id1).not.toBe(id3);
      expect(id1).toMatch(/^agent-auditor-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/);
    });

    it("throws an error when parentAgentId or taskDesc is empty", () => {
      expect(() => launchAuditor("", "task")).toThrow("parentAgentId is required to launch auditor");
      expect(() => launchAuditor("parent", "")).toThrow("taskDesc is required to launch auditor");
    });
  });

  describe("terminateDriftedAgents", () => {
    const baseAgents: ActiveAgent[] = [
      {
        id: "agent-1",
        role: "auditor",
        status: "active",
        metrics: {
          driftScore: 0.1,
          convergenceRate: 0.98,
          errorRate: 0.01,
          consecutiveFailures: 0
        }
      },
      {
        id: "agent-2",
        role: "doctor",
        status: "active",
        metrics: {
          driftScore: 0.6, // Drifted
          convergenceRate: 0.97,
          errorRate: 0.02,
          consecutiveFailures: 1
        }
      },
      {
        id: "agent-3",
        role: "wizard",
        status: "active",
        metrics: {
          driftScore: 0.2,
          convergenceRate: 0.9, // Drifted
          errorRate: 0.03,
          consecutiveFailures: 2
        }
      },
      {
        id: "agent-4",
        role: "telco",
        status: "active",
        metrics: {
          driftScore: 0.15,
          convergenceRate: 0.99,
          errorRate: 0.08, // Drifted
          consecutiveFailures: 0
        }
      },
      {
        id: "agent-5",
        role: "auditor",
        status: "active",
        metrics: {
          driftScore: 0.05,
          convergenceRate: 0.96,
          errorRate: 0.01,
          consecutiveFailures: 4 // Drifted
        }
      },
      {
        id: "agent-already-terminated",
        role: "auditor",
        status: "terminated",
        metrics: {
          driftScore: 0.9,
          convergenceRate: 0.5,
          errorRate: 0.5,
          consecutiveFailures: 10
        }
      }
    ];

    it("terminates agents exceeding driftScore limit", () => {
      const policy: DriftPolicy = { maxDriftScore: 0.5 };
      const { terminatedAgentIds, updatedAgents } = terminateDriftedAgents(baseAgents, policy);

      expect(terminatedAgentIds).toEqual(["agent-2"]);
      expect(updatedAgents.find(a => a.id === "agent-2")?.status).toBe("terminated");
      expect(updatedAgents.find(a => a.id === "agent-1")?.status).toBe("active");
    });

    it("terminates agents falling below convergenceRate limit", () => {
      const policy: DriftPolicy = { minConvergenceRate: 0.95 };
      const { terminatedAgentIds, updatedAgents } = terminateDriftedAgents(baseAgents, policy);

      expect(terminatedAgentIds).toEqual(["agent-3"]);
      expect(updatedAgents.find(a => a.id === "agent-3")?.status).toBe("terminated");
      expect(updatedAgents.find(a => a.id === "agent-1")?.status).toBe("active");
    });

    it("terminates agents exceeding errorRate limit", () => {
      const policy: DriftPolicy = { maxErrorRate: 0.05 };
      const { terminatedAgentIds, updatedAgents } = terminateDriftedAgents(baseAgents, policy);

      expect(terminatedAgentIds).toEqual(["agent-4"]);
      expect(updatedAgents.find(a => a.id === "agent-4")?.status).toBe("terminated");
    });

    it("terminates agents exceeding consecutiveFailures limit", () => {
      const policy: DriftPolicy = { maxConsecutiveFailures: 3 };
      const { terminatedAgentIds, updatedAgents } = terminateDriftedAgents(baseAgents, policy);

      expect(terminatedAgentIds).toEqual(["agent-5"]);
      expect(updatedAgents.find(a => a.id === "agent-5")?.status).toBe("terminated");
    });

    it("terminates agents using custom rule function", () => {
      const policy: DriftPolicy = {
        customRule: (agent) => agent.role === "telco"
      };
      const { terminatedAgentIds, updatedAgents } = terminateDriftedAgents(baseAgents, policy);

      expect(terminatedAgentIds).toEqual(["agent-4"]);
      expect(updatedAgents.find(a => a.id === "agent-4")?.status).toBe("terminated");
    });

    it("returns empty terminated list if no agents match criteria", () => {
      const policy: DriftPolicy = {
        maxDriftScore: 0.9,
        minConvergenceRate: 0.8,
        maxErrorRate: 0.2,
        maxConsecutiveFailures: 10
      };
      const { terminatedAgentIds } = terminateDriftedAgents(baseAgents, policy);
      expect(terminatedAgentIds).toEqual([]);
    });

    it("evaluates multiple policy criteria conjunctively/disjunctively (OR)", () => {
      const policy: DriftPolicy = {
        maxDriftScore: 0.5,
        minConvergenceRate: 0.95
      };
      const { terminatedAgentIds } = terminateDriftedAgents(baseAgents, policy);
      expect(terminatedAgentIds).toContain("agent-2");
      expect(terminatedAgentIds).toContain("agent-3");
      expect(terminatedAgentIds).toHaveLength(2);
    });
  });

  describe("rebalanceTasks", () => {
    it("releases task assignment from terminated agents and assigns pending tasks to active agents", () => {
      const activeAgents: ActiveAgent[] = [
        { id: "agent-1", role: "auditor", status: "active", metrics: {} },
        { id: "agent-2", role: "doctor", status: "active", metrics: {} },
        { id: "agent-3", role: "wizard", status: "terminated", metrics: {} } // Terminated!
      ];

      const taskQueue: SwarmTask[] = [
        { id: "task-1", description: "Audit code change", roleRequired: "auditor", assignedAgentId: "agent-1", status: "assigned" },
        { id: "task-2", description: "Fix type error", roleRequired: "doctor", assignedAgentId: "agent-3", status: "assigned" }, // Assigned to terminated agent!
        { id: "task-3", description: "Format database", roleRequired: "wizard", assignedAgentId: null, status: "pending" } // Pending wizard task, but wizard is terminated
      ];

      const { rebalancedTasks, updatedAgents } = rebalanceTasks(taskQueue, activeAgents);

      // task-2 should be unassigned from agent-3 (terminated) and reassigned to doctor (agent-2)
      const t2 = rebalancedTasks.find(t => t.id === "task-2");
      expect(t2?.assignedAgentId).toBe("agent-2");
      expect(t2?.status).toBe("assigned");

      // agent-2 should now have task description updated
      const a2 = updatedAgents.find(a => a.id === "agent-2");
      expect(a2?.taskDesc).toBe("Fix type error");

      // task-3 remains pending because no active wizard is available
      const t3 = rebalancedTasks.find(t => t.id === "task-3");
      expect(t3?.assignedAgentId).toBeNull();
      expect(t3?.status).toBe("pending");
    });

    it("assigns tasks deterministically based on priority (highest first) and agent load", () => {
      const activeAgents: ActiveAgent[] = [
        { id: "agent-1", role: "auditor", status: "active", metrics: {} },
        { id: "agent-2", role: "auditor", status: "active", metrics: {} }
      ];

      const taskQueue: SwarmTask[] = [
        { id: "task-low", description: "Low priority task", roleRequired: "auditor", priority: 1, assignedAgentId: null, status: "pending" },
        { id: "task-high", description: "High priority task", roleRequired: "auditor", priority: 10, assignedAgentId: null, status: "pending" }
      ];

      const { rebalancedTasks } = rebalanceTasks(taskQueue, activeAgents);

      // Rebalancing should assign "task-high" first, then "task-low".
      // agent-1 (alphabetically first) gets task-high
      // agent-2 gets task-low
      const high = rebalancedTasks.find(t => t.id === "task-high");
      const low = rebalancedTasks.find(t => t.id === "task-low");

      expect(high?.assignedAgentId).toBe("agent-1");
      expect(low?.assignedAgentId).toBe("agent-2");
    });

    it("breaks ties deterministically using alphabetical agent ID sorting", () => {
      const activeAgents: ActiveAgent[] = [
        { id: "agent-b", role: "doctor", status: "active", metrics: {} },
        { id: "agent-a", role: "doctor", status: "active", metrics: {} }
      ];

      const taskQueue: SwarmTask[] = [
        { id: "task-1", description: "Triage issue", roleRequired: "doctor", priority: 5, assignedAgentId: null, status: "pending" }
      ];

      const { rebalancedTasks } = rebalanceTasks(taskQueue, activeAgents);

      // Should assign to agent-a (since both have load 0, but "agent-a" < "agent-b" alphabetically)
      const t1 = rebalancedTasks.find(t => t.id === "task-1");
      expect(t1?.assignedAgentId).toBe("agent-a");
    });

    it("clears taskDesc from agents that no longer have tasks assigned", () => {
      const activeAgents: ActiveAgent[] = [
        { id: "agent-1", role: "doctor", status: "active", taskDesc: "Old task", metrics: {} }
      ];

      const taskQueue: SwarmTask[] = [
        { id: "task-1", description: "Triage issue", roleRequired: "doctor", priority: 5, assignedAgentId: null, status: "completed" } // completed task is not assigned
      ];

      const { updatedAgents } = rebalanceTasks(taskQueue, activeAgents);
      const a1 = updatedAgents.find(a => a.id === "agent-1");
      expect(a1?.taskDesc).toBeNull();
    });
  });
});
