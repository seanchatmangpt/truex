/**
 * @module skill-sandbox
 * @description Skill Sandbox Validator. Audits skill descriptions to enforce repository laws.
 * Gall Classification: S2 (engine primitives).
 */

/**
 * Skill Sandbox Validator
 * Audits skill markdown descriptions and embedded scripts to enforce repository laws.
 */

export interface ValidationResult {
  valid: boolean;
  violations: string[];
}

/**
 * Validates a skill description to verify that it does not attempt to violate repository laws.
 * Specifically checks for:
 * - Math.random (Entropy Law)
 * - Clock/time dependencies (Date.now, new Date, performance.now, process.hrtime, setTimeout, setInterval, setImmediate, Date())
 * - Prototype pollution/modification (__proto__, .prototype, constructor.prototype, Object.prototype)
 *
 * @param skillMarkdown The markdown content of the skill description
 * @returns An object containing the validation status and a list of violations (if any)
 */
export function validateSkillMarkdown(skillMarkdown: string): ValidationResult {
  if (typeof skillMarkdown !== "string") {
    return {
      valid: false,
      violations: ["Invalid input: skillMarkdown must be a string."],
    };
  }

  const violations: string[] = [];

  // 1. Check for Math.random (case-sensitive as it is a JS API)
  const mathRandomRegex = /Math\.random/;
  if (mathRandomRegex.test(skillMarkdown)) {
    violations.push("Use of Math.random is forbidden to ensure deterministic execution (Entropy Law).");
  }

  // 2. Check for clock calls / time references
  const clockPatterns = [
    { regex: /\bDate\.now\b/, name: "Date.now" },
    { regex: /\bnew\s+Date\b/, name: "new Date" },
    { regex: /\bDate\(\s*\)/, name: "Date() call" },
    { regex: /\bperformance\.now\b/, name: "performance.now" },
    { regex: /\bprocess\.hrtime\b/, name: "process.hrtime" },
    { regex: /\bsetTimeout\b/, name: "setTimeout" },
    { regex: /\bsetInterval\b/, name: "setInterval" },
    { regex: /\bsetImmediate\b/, name: "setImmediate" },
  ];

  for (const pattern of clockPatterns) {
    if (pattern.regex.test(skillMarkdown)) {
      violations.push(`Clock calls or time dependencies (${pattern.name}) are forbidden to ensure replayability and time-independence.`);
    }
  }

  // 3. Check for prototype pollution / modification
  const protoPatterns = [
    { regex: /__proto__/, name: "__proto__" },
    { regex: /\[\s*["']__proto__["']\s*\]/, name: "bracket __proto__ access" },
    { regex: /\[\s*["']prototype["']\s*\]/, name: "bracket prototype access" },
    { regex: /\bObject\.prototype\b/, name: "Object.prototype" },
    { regex: /\bconstructor\.prototype\b/, name: "constructor.prototype" },
    { regex: /\.prototype\b/, name: "dot prototype access" },
  ];

  for (const pattern of protoPatterns) {
    if (pattern.regex.test(skillMarkdown)) {
      violations.push(`Prototype pollution or modification (${pattern.name}) is forbidden to prevent security and boundary violations.`);
      break; // Report prototype pollution once to avoid duplicate-style error messages
    }
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}
