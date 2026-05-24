/**
 * @module emit-artifacts
 * @description
 * Gall Classification: Observatory Output Formatting
 * Purpose: Converts raw observatory JSON facts into human-readable Markdown artifacts.
 */
import fs from 'node:fs';
import path from 'node:path';

const BASE_DIR = process.cwd();
const FACTS_DIR = path.join(BASE_DIR, 'docs/v1/latest/facts');
const ARTIFACTS_DIR = path.join(BASE_DIR, 'docs/artifacts');

/**
 * Ensures a directory exists, creating it and its parents if necessary.
 * @param dir The directory path to ensure.
 */
function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Generates a Markdown document based on the artifact name and its corresponding facts.
 * @param name The name of the artifact (e.g., 'core-primitives').
 * @param data The JSON data object containing the facts.
 * @returns The formatted Markdown string.
 */
function generateMarkdown(name: string, data: any): string {
  let md = `# Antigravity Artifact: ${name.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}\n\n`;
  
  const timestamp = data.timestamp || data._metadata?.timestamp || new Date().toISOString();
  md += `> **Generated:** ${timestamp}\n`;
  if (data.version) md += `> **Version:** ${data.version}\n`;
  md += `\n`;

  switch (name) {
  case 'core-primitives': {
    md += `## Core Primitives\n\n`;
    if (data.corePrimitives) {
      for (const [key, primitive] of Object.entries(data.corePrimitives as any)) {
        md += `### ${key.toUpperCase()}\n`;
        md += `- **Files:** ${(primitive as any).files?.join(', ') || 'N/A'}\n`;
        md += `- **Resolved Symbols:** ${(primitive as any).resolvedSymbols?.join(', ') || 'N/A'}\n\n`;
      }
    }

    if (data.stats) {
      md += `## Stats\n\n`;
      md += `| Metric | Value |\n`;
      md += `| :--- | :--- |\n`;
      for (const [key, value] of Object.entries(data.stats)) {
        md += `| ${key} | ${value} |\n`;
      }
      md += `\n`;
    }

    if (data.files) {
      md += `## File Inventory\n\n`;
      md += `| Path | Functions | Classes | Symbols |\n`;
      md += `| :--- | :--- | :--- | :--- |\n`;
      for (const file of (data.files as any[])) {
        md += `| \`${file.path}\` | ${file.functions} | ${file.classes} | ${file.symbols?.length || 0} |\n`;
      }
    }
  
  break;
  }
  case 'manufacturing': {
    md += `## Manufacturing Pillars\n\n`;
    if (data.pillars) {
      for (const [key, pillar] of Object.entries(data.pillars as any)) {
        md += `### ${key.toUpperCase()}\n`;
        md += `- **Description:** ${(pillar as any).description}\n`;
        md += `- **Components:** ${(pillar as any).components?.join(', ') || 'N/A'}\n\n`;
      }
    }

    if (data.repositoryLaws) {
      md += `## Repository Laws\n\n`;
      md += `| ID | Name | Condition |\n`;
      md += `| :--- | :--- | :--- |\n`;
      for (const law of (data.repositoryLaws as any[])) {
        md += `| \`${law.id}\` | ${law.name} | ${law.condition} |\n`;
      }
      md += `\n`;
    }

    if (data.files) {
      md += `## Manufacturing Files\n\n`;
      for (const file of (data.files as any[])) {
        md += `- \`${file}\`\n`;
      }
    }
  
  break;
  }
  case 'agy-integration': {
    md += `## Integration Strategy\n\n`;
    md += `- **Type:** ${data.integrationType}\n`;
    if (data.bridge) {
      md += `- **Bridge:** ${data.bridge.name} (\`${data.bridge.file}\`)\n`;
      md += `- **Purpose:** ${data.bridge.purpose}\n\n`;
    }

    if (data.hooks) {
      md += `## Active Hooks\n\n`;
      for (const [id, hook] of Object.entries(data.hooks as any)) {
        md += `### ${id}\n`;
        md += `- **Event:** ${(hook as any).event}\n`;
        md += `- **Matcher:** \`${(hook as any).matcher}\`\n`;
        md += `- **Script:** \`${(hook as any).script}\`\n`;
        md += `- **Enabled:** ${(hook as any).enabled}\n\n`;
      }
    }
  
  break;
  }
  case 'persistence': {
    md += `## Persistence Layer\n\n`;
    md += `- **Layer:** ${data.layer}\n`;
    
    if (data.sqlite) {
      md += `\n### SQLite Membrane\n`;
      md += `- **Engine:** ${data.sqlite.engine}\n`;
      md += `- **Tables:** ${data.sqlite.tables?.join(', ') || 'N/A'}\n`;
      md += `- **Mechanisms:** ${data.sqlite.mechanisms?.join(', ') || 'N/A'}\n`;
    }
    
    if (data.journaling) {
      md += `\n### Journaling\n`;
      md += `- **Name:** ${data.journaling.name}\n`;
      md += `- **Description:** ${data.journaling.description}\n`;
      md += `- **Table:** ${data.journaling.table}\n`;
      md += `- **Fields:** ${data.journaling.fields?.join(', ') || 'N/A'}\n`;
    }

    if (data.snapshotting) {
      md += `\n### Snapshotting\n`;
      md += `- **Manager:** ${data.snapshotting.manager}\n`;
      md += `- **Format:** ${data.snapshotting.format}\n`;
      md += `- **Capabilities:** ${data.snapshotting.capabilities?.join(', ') || 'N/A'}\n`;
    }
  
  break;
  }
  case 'diagnostics': {
    if (data.health_check) {
      md += `## Health Check\n\n`;
      md += `- **Status:** ${data.health_check.status}\n\n`;
      if (data.health_check.checks) {
        for (const check of data.health_check.checks) {
          md += `### ${check.name}\n`;
          md += `- **Description:** ${check.description}\n`;
          md += `- **Status:** ${check.status}\n`;
          if (check.symbols) md += `- **Symbols:** ${check.symbols.join(', ')}\n`;
          md += '\n';
        }
      }
    }
    
    if (data.coverage) {
      md += `## Coverage\n\n`;
      md += `- **Status:** ${data.coverage.status}\n`;
      md += `- **Message:** ${data.coverage.message}\n`;
    }
  
  break;
  }
  case 'refusal-analysis': {
    md += `## Refusal Analysis & Correction\n\n`;
    if (data.has_refusals) {
      md += `⚠️ **Drift Detected!** A recent operation was refused by the Truex Bridge.\n\n`;
      md += `### Refusal Metadata\n`;
      md += `- **Receipt ID:** \`${data.latest_refusal.id}\`\n`;
      md += `- **Event ID:** \`${data.latest_refusal.event_id}\`\n`;
      md += `- **Timestamp:** ${data.latest_refusal.timestamp}\n\n`;

      md += `### Correction Proposals\n\n`;
      for (const prop of data.correction_proposals) {
        md += `#### ${prop.violation}\n`;
        md += `> **Reason:** ${prop.reason}\n\n`;
        md += `**Proposed Action:**\n`;
        md += `${prop.suggestion}\n\n`;
      }
    } else {
      md += `✅ **No refusals detected.** The system is in alignment with Repository Laws.\n`;
    }
  
  break;
  }
  case 'refinement-rules': {
    md += `## Refinement Strategy\n\n`;
    md += `These rules help the bridge auto-correct agent tool calls to use internal, deterministic paths.\n\n`;

    if (data.rules) {
      md += `### Deterministic Mapping Rules\n\n`;
      md += `| Target Symbol | Source File | Action | Description |\n`;
      md += `| :--- | :--- | :--- | :--- |\n`;
      for (const rule of (data.rules as any[])) {
        md += `| \`${rule.targetSymbol}\` | \`${rule.sourceFile}\` | ${rule.action} | ${rule.description} |\n`;
      }
      md += `\n`;
    }

    if (data.heuristics) {
      md += `### Bridge Heuristics\n\n`;
      md += `| Ambient Tool | Pattern | Correction | Severity |\n`;
      md += `| :--- | :--- | :--- | :--- |\n`;
      for (const h of (data.heuristics as any[])) {
        md += `| \`${h.ambientTool}\` | \`${h.pattern}\` | ${h.correction} | ${h.severity} |\n`;
      }
      md += `\n`;
    }

    if (data.stats) {
      md += `### Stats\n\n`;
      md += `- **Internal Symbols:** ${data.stats.internalSymbolsCount}\n`;
      md += `- **Generated Rules:** ${data.stats.rulesGenerated}\n`;
      md += `- **Heuristics:** ${data.stats.heuristicsCount}\n`;
    }
  
  break;
  }
  case 'project-evidence-gapclose': {
    md += `## S12G Gapclose Verification\n\n`;
    if (data.report) {
      md += `### Status & Metadata\n`;
      md += `- **Passed:** ${data.report.passed ? '✅ Yes' : '❌ No'}\n`;
      md += `- **Receipt Hash:** \`${data.report.receiptHash || 'N/A'}\`\n\n`;

      if (data.report.invariants && data.report.invariants.length > 0) {
        md += `### Invariants Proven\n`;
        for (const inv of data.report.invariants) {
          md += `- ${inv}\n`;
        }
        md += `\n`;
      }
      
      if (data.report.failures && data.report.failures.length > 0) {
        md += `### Failures\n`;
        for (const fail of data.report.failures) {
          md += `- ❌ ${fail}\n`;
        }
        md += `\n`;
      }
    }

    if (data.ledger && data.ledger.domains) {
      md += `### S12G Domain Ledger Table\n\n`;
      md += `| Domain | Attempted | Succeeded | Failed | Refused | Quarantined | Skipped | Status |\n`;
      md += `| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |\n`;
      for (const d of data.ledger.domains) {
        md += `| **${d.domain}** | ${d.attempted} | ${d.succeeded} | ${d.failed} | ${d.refused} | ${d.quarantined} | ${d.skipped} | ${d.status} |\n`;
      }
      md += `\n`;
    }
    break;
  }
  default: {
    // Generic fallback for other facts
    md += `## Data Summary\n\n`;
    md += '```json\n' + JSON.stringify(data, null, 2) + '\n```\n';
  }
  }

  md += `\n---\n*Artifact generated by Truex Observatory.*`;
  
  return md;
}

/**
 * Iterates through all emitted JSON facts and converts them into Markdown artifacts.
 * The resulting documents are written to the 'docs/artifacts' directory.
 * @returns A promise that resolves when all artifacts have been generated.
 */
export async function emitArtifacts() {
  console.log('💎 Emitting Antigravity Artifacts...');
  
  if (!fs.existsSync(FACTS_DIR)) {
    console.warn(`⚠️ Facts directory not found: ${FACTS_DIR}`);
    return;
  }

  ensureDir(ARTIFACTS_DIR);

  const files = fs.readdirSync(FACTS_DIR).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const name = path.basename(file, '.json');
    const filePath = path.join(FACTS_DIR, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    const md = generateMarkdown(name, data);
    const outputPath = path.join(ARTIFACTS_DIR, `${name}.md`);
    
    fs.writeFileSync(outputPath, md);
    console.log(`📄 Created artifact: ${outputPath}`);
  }
  
  console.log('✅ Artifact emission complete!');
}

// Self-execute if run as a script
import { fileURLToPath } from 'node:url';
const isMain = process.argv[1] && (
  process.argv[1].endsWith('emit-artifacts.ts') || 
  process.argv[1].endsWith('emit-artifacts.js') ||
  process.argv[1] === fileURLToPath(import.meta.url)
);

if (isMain) {
  emitArtifacts().catch(error_ => {
    console.error('❌ Failed to emit artifacts:', error_);
    process.exit(1);
  });
}
