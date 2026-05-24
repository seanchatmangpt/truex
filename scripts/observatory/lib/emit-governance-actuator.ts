/**
 * @module emit-governance-actuator
 * @description
 * Gall Classification: S4 Governance Actuator
 * Purpose: Detects if AGENTS.md is out of sync with proven runtime primitives.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FactEmitter, EmitterMetadata } from './fact-emitter.js';

const BASE_DIR = process.cwd();
const AGENTS_MD_PATH = path.join(BASE_DIR, 'AGENTS.md');
const CORE_PRIMITIVES_PATH = path.join(BASE_DIR, 'docs/v1/latest/facts/core-primitives.json');
const OUTPUT_FILE = 'docs/artifacts/governance-update.md';

/**
 * Emitter for analyzing the gap between runtime evidence and repository laws,
 * generating governance update proposals if synchronization drifts.
 */
export class GovernanceActuatorEmitter extends FactEmitter {
  getMetadata(): EmitterMetadata {
    return {
      name: 'Governance Actuator Emitter',
      description: 'Detects if AGENTS.md is out of sync with proven runtime primitives',
      outputPath: OUTPUT_FILE
    };
  }

  protected async collectFacts() {
    if (!fs.existsSync(AGENTS_MD_PATH)) {
      throw new Error(`AGENTS.md not found at ${AGENTS_MD_PATH}`);
    }
    if (!fs.existsSync(CORE_PRIMITIVES_PATH)) {
      throw new Error(`core-primitives.json not found at ${CORE_PRIMITIVES_PATH}`);
    }

    const agentsMd = fs.readFileSync(AGENTS_MD_PATH, 'utf8');
    const corePrimitivesJson = JSON.parse(fs.readFileSync(CORE_PRIMITIVES_PATH, 'utf8'));
    const provenPrimitives = Object.keys(corePrimitivesJson.corePrimitives);

    // Extract current stack from AGENTS.md
    // Look for the block under # CURRENT GALL STACK
    const stackSectionMatch = agentsMd.match(/# CURRENT GALL STACK\n\n([\s\S]+?)(?:\n\n#|\n$)/);
    const currentStackText = stackSectionMatch ? stackSectionMatch[1] : '';
    
    const stackLines = currentStackText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const stackPrimitives: string[] = [];
    
    for (const line of stackLines) {
      if (line.includes(' primitives')) {
        stackPrimitives.push(line.replace(' primitives', '').trim());
      } else if (line === 'truex-test-utils') {
        stackPrimitives.push(line);
      }
    }

    const missingInStack = provenPrimitives.filter(p => !stackPrimitives.includes(p));
    // We allow truex-test-utils as it's a known non-primitive bootstrap
    const extraInStack = stackPrimitives.filter(p => !provenPrimitives.includes(p) && p !== 'truex-test-utils');

    const outOfSync = missingInStack.length > 0 || extraInStack.length > 0;

    return this.generateProposal(agentsMd, currentStackText, provenPrimitives, missingInStack, extraInStack, outOfSync);
  }

  private toSubscript(n: number): string {
    const subscripts = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
    const s = Math.abs(n).toString();
    let res = n < 0 ? '₋' : '';
    for (const char of s) {
      res += subscripts[Number.parseInt(char)];
    }
    return res;
  }

  private generateProposal(
    agentsMd: string, 
    currentStackText: string,
    provenPrimitives: string[], 
    missing: string[], 
    extra: string[],
    outOfSync: boolean
  ): string {
    let proposal = `# PROPOSAL: Update AGENTS.md\n\n`;
    proposal += `## STATUS\n\n`;
    
    proposal += outOfSync ? `⚠️ **OUT OF SYNC**: The current \`AGENTS.md\` does not match proven runtime primitives.\n\n` : `✅ **IN SYNC**: \`AGENTS.md\` is aligned with proven runtime primitives.\n\n`;

    proposal += `## ANALYSIS\n\n`;
    
    if (missing.length > 0) {
      proposal += `### 🔴 MISSING FROM LAW\n\n`;
      proposal += `The following primitives are proven in \`core-primitives.json\` but missing from \`AGENTS.md\` Gall stack:\n\n`;
      for (const p of missing) proposal += `- \`${p}\`\n`;
      proposal += `\n`;
    }
    
    if (extra.length > 0) {
      proposal += `### 🟡 UNPROVEN IN LAW\n\n`;
      proposal += `The following are listed in \`AGENTS.md\` Gall stack but are not yet registered as proven primitives:\n\n`;
      for (const p of extra) proposal += `- \`${p}\`\n`;
      proposal += `\n`;
    }

    if (!outOfSync) {
      proposal += `No changes required at this time.\n`;
      return proposal;
    }

    proposal += `## PROPOSED CHANGES\n\n`;
    proposal += `### Replace Fossilized Stack\n\n`;
    
    // Construct a new, modernized stack based on proven primitives
    let newStackText = `S₋₂:\ntruex-test-utils\n\n`;
    
    // We'll try to preserve some order but ensure all proven ones are there
    const order = ['hash', 'signature', 'receipt', 'replay'];
    let level = -1;
    
    for (const p of order) {
        if (provenPrimitives.includes(p)) {
            newStackText += `S${this.toSubscript(level)}:\n${p} primitives\n\n`;
            level++;
        }
    }

    // Add back unproven ones
    if (extra.includes('engine')) {
        newStackText += `S${this.toSubscript(level)}:\nengine primitives\n\n`;
        level++;
    }
    
    if (extra.includes('sqlite membrane')) {
        newStackText += `S${this.toSubscript(level)}:\nsqlite membrane primitives\n\n`;
        level++;
    }

    newStackText += `Higher layers are forbidden until these converge.\n\n---`;
    newStackText = newStackText.trim();

    proposal += `To bring the law into alignment with the runtime evidence, apply the following replacement:\n\n`;
    
    proposal += `**Target File**: \`AGENTS.md\`\n\n`;
    
    proposal += `**Operation**: \`replace\`\n\n`;
    
    proposal += `**Old String**:\n\`\`\`markdown\n${currentStackText}\n\`\`\`\n\n`;
    
    proposal += `**New String**:\n\`\`\`markdown\n${newStackText}\n\`\`\`\n\n`;

    proposal += `---\n*Generated by Governance Actuator Emitter on ${new Date().toISOString()}*\n`;

    return proposal;
  }
}

/**
 * Instantiates the GovernanceActuatorEmitter and executes the gap analysis.
 * @returns A promise resolving to the generated governance proposal content.
 */
export async function emitGovernanceActuator() {
  const emitter = new GovernanceActuatorEmitter();
  return emitter.emit();
}

// Self-execute if run as a script
const isMain = process.argv[1] && (
  process.argv[1].endsWith('emit-governance-actuator.ts') || 
  process.argv[1].endsWith('emit-governance-actuator.js') ||
  process.argv[1] === fileURLToPath(import.meta.url)
);

if (isMain) {
  emitGovernanceActuator();
}
