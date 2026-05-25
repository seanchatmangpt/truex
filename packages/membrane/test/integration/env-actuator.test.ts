import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  regenerateObservatoryDiagrams,
  mutateAgentsRules,
  normalizeArtifacts
} from '../../src/integration/env-actuator.js';
import type { Quad } from '../../src/runtime-law.js';

describe('S3 Environmental Consequence Engine (env-actuator)', () => {
  let tempDir: string;

  beforeEach(() => {
    // Create a temporary directory unique to this test run
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'truex-env-actuator-test-'));
  });

  afterEach(() => {
    // Clean up temporary files and directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('regenerateObservatoryDiagrams', () => {
    it('should generate a valid markdown file with a mermaid flowchart from quads', async () => {
      const outputPath = path.join(tempDir, 'docs/observatory.md');
      const quads: Quad[] = [
        { subject: 'urn:node:1', predicate: 'prov:wasDerivedFrom', object: 'urn:node:2' },
        { subject: 'urn:node:2', predicate: 'prov:wasInfluencedBy', object: 'urn:node:3' }
      ];

      const result = await regenerateObservatoryDiagrams(quads, outputPath);

      expect(fs.existsSync(outputPath)).toBe(true);
      expect(result).toContain('# Observatory Diagram');
      expect(result).toContain('flowchart TD');
      
      // Node hex ID mapping checking
      const content = fs.readFileSync(outputPath, 'utf8');
      expect(content).toContain('urn:node:1');
      expect(content).toContain('urn:node:2');
      expect(content).toContain('urn:node:3');
      expect(content).toContain('prov:wasDerivedFrom');
      expect(content).toContain('prov:wasInfluencedBy');
    });

    it('should handle special characters in quads cleanly by escaping quotes', async () => {
      const outputPath = path.join(tempDir, 'docs/escaped.md');
      const quads: Quad[] = [
        {
          subject: 'urn:node:"with-quotes"',
          predicate: 'prov:hasLabel',
          object: 'Label [with brackets] and (parentheses)'
        }
      ];

      await regenerateObservatoryDiagrams(quads, outputPath);
      const content = fs.readFileSync(outputPath, 'utf8');

      // The quotes should be escaped
      // eslint-disable-next-line unicorn/prefer-string-raw
      expect(content).toContain('urn:node:\\"with-quotes\\"');
      // The labels should be in quotes
      expect(content).toContain('["Label [with brackets] and (parentheses)"]');
    });

    it('should prevent duplicate edges in the mermaid diagram', async () => {
      const outputPath = path.join(tempDir, 'docs/deduplicated.md');
      const quads: Quad[] = [
        { subject: 'urn:node:1', predicate: 'prov:wasDerivedFrom', object: 'urn:node:2' },
        { subject: 'urn:node:1', predicate: 'prov:wasDerivedFrom', object: 'urn:node:2' } // Duplicate
      ];

      await regenerateObservatoryDiagrams(quads, outputPath);
      const content = fs.readFileSync(outputPath, 'utf8');

      // Count the number of arrow relations
      const matches = content.match(/-->/g);
      expect(matches).not.toBeNull();
      expect(matches!.length).toBe(1);
    });

    it('should generate an empty diagram indicator when no quads are provided', async () => {
      const outputPath = path.join(tempDir, 'docs/empty.md');
      const result = await regenerateObservatoryDiagrams([], outputPath);
      const content = fs.readFileSync(outputPath, 'utf8');

      expect(result).toContain('Empty["No data available"]');
      expect(content).toContain('Empty["No data available"]');
    });
  });

  describe('mutateAgentsRules', () => {
    it('should create an AGENTS.md file with invariants section if it does not exist', async () => {
      const agentsMdPath = path.join(tempDir, 'AGENTS.md');
      const invariants = [
        'Each agent must be registered in the directory.',
        'No direct database mutations allowed.'
      ];

      await mutateAgentsRules(agentsMdPath, invariants);

      expect(fs.existsSync(agentsMdPath)).toBe(true);
      const content = fs.readFileSync(agentsMdPath, 'utf8');
      expect(content).toContain('# Invariants');
      expect(content).toContain('- Each agent must be registered in the directory.');
      expect(content).toContain('- No direct database mutations allowed.');
    });

    it('should append new invariants under ## Invariants if the section already exists', async () => {
      const agentsMdPath = path.join(tempDir, 'AGENTS.md');
      const initialContent = `# Doctor mandate\n\n## Invariants\n- Existing rule 1\n- Existing rule 2\n\n## Other Section\nSome text\n`;
      fs.writeFileSync(agentsMdPath, initialContent, 'utf8');

      await mutateAgentsRules(agentsMdPath, [
        'New appended rule 3',
        'New appended rule 4'
      ]);

      const content = fs.readFileSync(agentsMdPath, 'utf8');
      
      // Check that they are under ## Invariants before ## Other Section
      const lines = content.split('\n').map(l => l.trim());
      const invIndex = lines.indexOf('## Invariants');
      const otherSecIndex = lines.indexOf('## Other Section');
      const rule3Index = lines.indexOf('- New appended rule 3');
      const rule4Index = lines.indexOf('- New appended rule 4');

      expect(invIndex).toBeGreaterThan(-1);
      expect(otherSecIndex).toBeGreaterThan(invIndex);
      expect(rule3Index).toBeGreaterThan(invIndex);
      expect(rule3Index).toBeLessThan(otherSecIndex);
      expect(rule4Index).toBeGreaterThan(rule3Index);
      expect(rule4Index).toBeLessThan(otherSecIndex);
    });

    it('should append a new ## Invariants section if the file exists but lacks one', async () => {
      const agentsMdPath = path.join(tempDir, 'AGENTS.md');
      const initialContent = `# Doctor mandate\n\nSome text explaining the doctor.\n`;
      fs.writeFileSync(agentsMdPath, initialContent, 'utf8');

      await mutateAgentsRules(agentsMdPath, ['Appended invariant 1']);

      const content = fs.readFileSync(agentsMdPath, 'utf8');
      expect(content).toContain('## Invariants');
      expect(content).toContain('- Appended invariant 1');
    });

    it('should be idempotent and not append invariants that are already present', async () => {
      const agentsMdPath = path.join(tempDir, 'AGENTS.md');
      const initialContent = `## Invariants\n- Rule 1\n`;
      fs.writeFileSync(agentsMdPath, initialContent, 'utf8');

      // Attempt to append Rule 1 again and a new Rule 2
      await mutateAgentsRules(agentsMdPath, ['Rule 1', 'Rule 2']);

      const content = fs.readFileSync(agentsMdPath, 'utf8');
      
      // Rule 1 should only occur once in the entire file
      const rule1Count = (content.match(/- Rule 1/g) || []).length;
      const rule2Count = (content.match(/- Rule 2/g) || []).length;

      expect(rule1Count).toBe(1);
      expect(rule2Count).toBe(1);
    });
  });

  describe('normalizeArtifacts', () => {
    it('should create walkthrough report and append all diffs if it does not exist', async () => {
      const walkthroughPath = path.join(tempDir, 'docs/walkthrough.md');
      const diffs = {
        'src/core.ts': '- oldLine\n+ newLine',
        'src/utils.ts': '- false\n+ true'
      };

      await normalizeArtifacts(walkthroughPath, diffs);

      expect(fs.existsSync(walkthroughPath)).toBe(true);
      const content = fs.readFileSync(walkthroughPath, 'utf8');
      expect(content).toContain('### Changes to `src/core.ts`');
      expect(content).toContain('```diff\n- oldLine\n+ newLine\n```');
      expect(content).toContain('### Changes to `src/utils.ts`');
      expect(content).toContain('```diff\n- false\n+ true\n```');
    });

    it('should update the existing diff block inside a matched section in the walkthrough', async () => {
      const walkthroughPath = path.join(tempDir, 'docs/walkthrough.md');
      const initialContent = `
# Walkthrough Report

### Changes to \`src/core.ts\`

Some initial description here.

\`\`\`diff
- oldLine
+ newLine
\`\`\`

### Changes to other files
Nothing here.
`;
      fs.mkdirSync(path.dirname(walkthroughPath), { recursive: true });
      fs.writeFileSync(walkthroughPath, initialContent, 'utf8');

      const updatedDiffs = {
        'src/core.ts': '- oldLine\n+ updatedNewLine\n+ extraAddedLine'
      };

      await normalizeArtifacts(walkthroughPath, updatedDiffs);

      const content = fs.readFileSync(walkthroughPath, 'utf8');
      
      // Should replace the original diff with the updated one
      expect(content).toContain('+ updatedNewLine');
      expect(content).toContain('+ extraAddedLine');
      expect(content).not.toContain('+ newLine');
      expect(content).toContain('Some initial description here.');
      expect(content).toContain('### Changes to other files');
    });

    it('should insert a code block if the section header exists but has no code block', async () => {
      const walkthroughPath = path.join(tempDir, 'docs/walkthrough.md');
      const initialContent = `
# Walkthrough Report

### Changes to \`src/core.ts\`
No changes made yet.

### Other sections
`;
      fs.mkdirSync(path.dirname(walkthroughPath), { recursive: true });
      fs.writeFileSync(walkthroughPath, initialContent, 'utf8');

      await normalizeArtifacts(walkthroughPath, {
        'src/core.ts': '+ addedDirectly'
      });

      const content = fs.readFileSync(walkthroughPath, 'utf8');
      expect(content).toContain('No changes made yet.');
      expect(content).toContain('```diff\n+ addedDirectly\n```');
    });
  });
});
