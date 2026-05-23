/* eslint-disable unicorn/no-null */
import { hash } from "../hash.js";
import type { GraphDelta, Quad } from "../runtime-law.js";

/**
 * Compiles a markdown task list into a GraphDelta.
 * Identifying incomplete `- [ ]` and complete `- [x]` or `- [X]` items.
 * Compiles them into a GraphDelta structure consisting of quads matching:
 * `<urn:agy:task:item_name> <prov:hasStatus> 'confirmed' | 'unconfirmed'`
 *
 * @param taskText - The markdown content containing the task list.
 * @returns A GraphDelta representing the state of the task list.
 */
export function compileTaskToDelta(taskText: string): GraphDelta {
  const lines = taskText.split(/\r?\n/);
  const adds: Quad[] = [];

  // Match: - [ ] Task item OR - [x] Task item OR - [X] Task item
  // Support optional spaces before the dash, and optional spaces inside and around the brackets.
  const taskRegex = /^\s*-\s*\[\s*([xX]?)\s*\]\s*(.*)$/;

  for (const line of lines) {
    const match = taskRegex.exec(line);
    if (match) {
      const isComplete = match[1] !== "";
      const rawText = match[2];
      
      // Normalize item name: lowercased, spaces to underscores, remove invalid chars for URN
      const itemName = rawText
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_\-.]/g, "");

      if (itemName) {
        adds.push({
          subject: `urn:agy:task:${itemName}`,
          predicate: "prov:hasStatus",
          object: isComplete ? "confirmed" : "unconfirmed",
          graph: null
        });
      }
    }
  }

  // Generate a deterministic ID for the delta using its content
  const deltaId = `task-delta-${hash({ taskText, adds })}`;

  return {
    id: deltaId,
    adds,
    deletes: []
  };
}
