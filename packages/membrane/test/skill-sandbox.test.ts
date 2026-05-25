import { describe, it, expect } from "vitest";
import { validateSkillMarkdown } from "../src/integration/skill-sandbox.js";

describe("Skill Sandbox Markdown Validator", () => {
  it("should permit a valid skill markdown description without violations", () => {
    const validMarkdown = `
# Skill: Hash Calculation
This skill calculates canonical BLAKE3 hashes for inputs.
It performs pure mathematical transformations.

## Execution Example
\`\`\`typescript
const result = computeHash(input);
\`\`\`
    `;

    const result = validateSkillMarkdown(validMarkdown);
    expect(result.valid).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it("should permit normal usage of the word 'prototype' in prose", () => {
    const validProse = `
# Skill: Membrane
It is crucial that the prototype chain is preserved for all proxy objects.
We should document the prototype hierarchy of our state models.
    `;

    const result = validateSkillMarkdown(validProse);
    expect(result.valid).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it("should permit standard class constructors in scripts", () => {
    const validClass = `
# Skill: Custom Component
\`\`\`typescript
class CustomComponent {
  constructor() {
    this.name = "default";
  }
}
\`\`\`
    `;

    const result = validateSkillMarkdown(validClass);
    expect(result.valid).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it("should reject Math.random in text instructions", () => {
    const invalidMarkdown = `
# Random Generator
Use Math.random to get a unique identifier for transaction.
    `;

    const result = validateSkillMarkdown(invalidMarkdown);
    expect(result.valid).toBe(false);
    expect(result.violations).toContain(
      "Use of Math.random is forbidden to ensure deterministic execution (Entropy Law)."
    );
  });

  it("should reject Math.random in embedded scripts", () => {
    const invalidMarkdown = `
# Mutation
\`\`\`javascript
const randomValue = Math.random();
\`\`\`
    `;

    const result = validateSkillMarkdown(invalidMarkdown);
    expect(result.valid).toBe(false);
    expect(result.violations).toContain(
      "Use of Math.random is forbidden to ensure deterministic execution (Entropy Law)."
    );
  });

  it("should reject clock calls like Date.now()", () => {
    const invalidMarkdown = `
# Logging
\`\`\`javascript
const time = Date.now();
\`\`\`
    `;

    const result = validateSkillMarkdown(invalidMarkdown);
    expect(result.valid).toBe(false);
    expect(result.violations[0]).toContain("Date.now");
  });

  it("should reject clock calls like new Date()", () => {
    const invalidMarkdown = `
# Event Timestamp
\`\`\`javascript
const time = new Date();
\`\`\`
    `;

    const result = validateSkillMarkdown(invalidMarkdown);
    expect(result.valid).toBe(false);
    expect(result.violations[0]).toContain("new Date");
  });

  it("should reject Date() calls", () => {
    const invalidMarkdown = `
# Event Timestamp
\`\`\`javascript
const time = Date();
\`\`\`
    `;

    const result = validateSkillMarkdown(invalidMarkdown);
    expect(result.valid).toBe(false);
    expect(result.violations[0]).toContain("Date() call");
  });

  it("should reject performance.now()", () => {
    const invalidMarkdown = `
# Benchmark
\`\`\`javascript
const start = performance.now();
\`\`\`
    `;

    const result = validateSkillMarkdown(invalidMarkdown);
    expect(result.valid).toBe(false);
    expect(result.violations[0]).toContain("performance.now");
  });

  it("should reject process.hrtime()", () => {
    const invalidMarkdown = `
# Benchmark
\`\`\`javascript
const start = process.hrtime();
\`\`\`
    `;

    const result = validateSkillMarkdown(invalidMarkdown);
    expect(result.valid).toBe(false);
    expect(result.violations[0]).toContain("process.hrtime");
  });

  it("should reject setTimeout, setInterval, setImmediate", () => {
    const timeoutMd = "Use setTimeout to wait.";
    const intervalMd = "Use setInterval to repeat.";
    const immediateMd = "Use setImmediate for microtasks.";

    expect(validateSkillMarkdown(timeoutMd).valid).toBe(false);
    expect(validateSkillMarkdown(intervalMd).valid).toBe(false);
    expect(validateSkillMarkdown(immediateMd).valid).toBe(false);
  });

  it("should reject prototype pollution using __proto__", () => {
    const invalidMarkdown = `
# Exploit
\`\`\`javascript
const target = {};
target.__proto__.polluted = true;
\`\`\`
    `;

    const result = validateSkillMarkdown(invalidMarkdown);
    expect(result.valid).toBe(false);
    expect(result.violations[0]).toContain("__proto__");
  });

  it("should reject prototype pollution using Object.prototype", () => {
    const invalidMarkdown = `
# Exploit
Object.prototype.polluted = true;
    `;

    const result = validateSkillMarkdown(invalidMarkdown);
    expect(result.valid).toBe(false);
    expect(result.violations[0]).toContain("Object.prototype");
  });

  it("should reject prototype pollution using constructor.prototype", () => {
    const invalidMarkdown = `
# Exploit
const target = {};
target.constructor.prototype.polluted = true;
    `;

    const result = validateSkillMarkdown(invalidMarkdown);
    expect(result.valid).toBe(false);
    expect(result.violations[0]).toContain("constructor.prototype");
  });

  it("should reject dot prototype assignment/access", () => {
    const invalidMarkdown = `
# Custom Extension
\`\`\`javascript
MyClass.prototype.custom = function() {};
\`\`\`
    `;

    const result = validateSkillMarkdown(invalidMarkdown);
    expect(result.valid).toBe(false);
    expect(result.violations[0]).toContain("dot prototype access");
  });

  it("should reject bracket prototype/proto access", () => {
    const invalidProto = `
# Exploit
target['prototype'].polluted = true;
    `;
    const invalidProto2 = `
# Exploit
target["prototype"].polluted = true;
    `;
    const invalidProto3 = `
# Exploit
target['__proto__'].polluted = true;
    `;

    expect(validateSkillMarkdown(invalidProto).valid).toBe(false);
    expect(validateSkillMarkdown(invalidProto2).valid).toBe(false);
    expect(validateSkillMarkdown(invalidProto3).valid).toBe(false);
  });

  it("should return an invalid result for non-string input", () => {
    const result = validateSkillMarkdown(undefined as any);
    expect(result.valid).toBe(false);
    expect(result.violations[0]).toContain("must be a string");
  });
});
