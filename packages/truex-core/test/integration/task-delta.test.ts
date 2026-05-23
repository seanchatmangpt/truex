/* eslint-disable unicorn/no-null */
import { describe, it, expect } from "vitest";
import { compileTaskToDelta } from "../../src/integration/task-delta.js";
import { parseGraphDelta } from "../../src/runtime-law.js";

describe("compileTaskToDelta integration tests", () => {
  it("compiles a basic markdown list with complete and incomplete tasks", () => {
    const markdown = `
# Task List
- [ ] Task one
- [x] Task two
- [X] Task three
    `;
    const delta = compileTaskToDelta(markdown);
    
    // Validate structural correctness of the returned delta
    const parsed = parseGraphDelta(delta);
    expect(parsed.id).toMatch(/^task-delta-[a-f0-9]+$/);
    expect(parsed.deletes).toEqual([]);
    expect(parsed.adds).toHaveLength(3);

    expect(parsed.adds[0]).toEqual({
      subject: "urn:agy:task:task_one",
      predicate: "prov:hasStatus",
      object: "unconfirmed",
      graph: null
    });

    expect(parsed.adds[1]).toEqual({
      subject: "urn:agy:task:task_two",
      predicate: "prov:hasStatus",
      object: "confirmed",
      graph: null
    });

    expect(parsed.adds[2]).toEqual({
      subject: "urn:agy:task:task_three",
      predicate: "prov:hasStatus",
      object: "confirmed",
      graph: null
    });
  });

  it("handles indented tasks correctly", () => {
    const markdown = `
  - [ ] Indented task
\t- [x] Tab indented task
    `;
    const delta = compileTaskToDelta(markdown);
    
    expect(delta.adds).toHaveLength(2);
    expect(delta.adds[0].subject).toBe("urn:agy:task:indented_task");
    expect(delta.adds[0].object).toBe("unconfirmed");
    expect(delta.adds[1].subject).toBe("urn:agy:task:tab_indented_task");
    expect(delta.adds[1].object).toBe("confirmed");
  });

  it("ignores non-task lines in markdown", () => {
    const markdown = `
Some introduction paragraph.
- This is a standard bullet point
* [ ] Bullet point with asterisk is not parsed
# Heading
- [ ] Valid task
    `;
    const delta = compileTaskToDelta(markdown);
    
    expect(delta.adds).toHaveLength(1);
    expect(delta.adds[0].subject).toBe("urn:agy:task:valid_task");
  });

  it("normalizes item names correctly by preserving alphanumeric, dashes, dots, and converting spaces to underscores", () => {
    const markdown = `
- [ ] Clean up  multiple   spaces  
- [ ] Set up truex-core version 1.0.0!
    `;
    const delta = compileTaskToDelta(markdown);

    expect(delta.adds).toHaveLength(2);
    expect(delta.adds[0].subject).toBe("urn:agy:task:clean_up_multiple_spaces");
    expect(delta.adds[1].subject).toBe("urn:agy:task:set_up_truex-core_version_1.0.0");
  });

  it("returns an empty adds array for empty list or no matches", () => {
    const markdown = `
Empty document.
    `;
    const delta = compileTaskToDelta(markdown);
    expect(delta.adds).toEqual([]);
    expect(delta.deletes).toEqual([]);
    expect(delta.id).toMatch(/^task-delta-[a-f0-9]+$/);
  });

  it("safely ignores empty task items", () => {
    const markdown = `
- [ ] 
- [x]     
- [ ] /
    `;
    const delta = compileTaskToDelta(markdown);
    // The third task contains "/", which is normalized to empty string (non-alphanumeric/dash/dot/underscore)
    // so it should be ignored.
    expect(delta.adds).toHaveLength(0);
  });

  it("produces deterministic output for the same input", () => {
    const markdown = `
- [ ] Task one
- [x] Task two
    `;
    const delta1 = compileTaskToDelta(markdown);
    const delta2 = compileTaskToDelta(markdown);

    expect(delta1.id).toBe(delta2.id);
    expect(delta1).toEqual(delta2);
  });
});
