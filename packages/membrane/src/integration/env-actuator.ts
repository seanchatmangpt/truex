/**
 * @module env-actuator
 * @description Environment actuator for generating artifacts, diagrams, and updating rules.
 * Gall Classification: S2 (engine primitives).
 */
import fs from 'node:fs';
import path from 'node:path';
import type { Quad } from '../runtime-law.js';

/**
 * Regenerates the markdown mermaid flowchart diagram based on the provided quads
 * and writes it to disk.
 *
 * @param quads - The active system quads to generate the diagram from.
 * @param outputPath - The file path where the markdown diagram should be written.
 *                     Defaults to 'docs/v1/latest/diagrams/observatory.md'.
 * @returns The generated markdown flowchart string.
 */
export async function regenerateObservatoryDiagrams(
  quads: Quad[],
  outputPath: string = 'docs/v1/latest/diagrams/observatory.md'
): Promise<string> {
  const toSafeId = (str: string): string => {
    // Return a safe hex identifier for mermaid node compatibility
    return 'n_' + Buffer.from(str, 'utf8').toString('hex').slice(0, 16);
  };

  const lines: string[] = ['flowchart TD'];
  const seenEdges = new Set<string>();

  if (quads.length === 0) {
    lines.push('    Empty["No data available"]');
  } else {
    for (const quad of quads) {
      const sId = toSafeId(quad.subject);
      const oId = toSafeId(quad.object);
      const edgeKey = `${sId}==${quad.predicate}==>${oId}`;

      if (!seenEdges.has(edgeKey)) {
        seenEdges.add(edgeKey);
        const sLabel = quad.subject.replace(/"/g, String.raw`\"`);
        const oLabel = quad.object.replace(/"/g, String.raw`\"`);
        lines.push(`    ${sId}["${sLabel}"] -->|${quad.predicate}| ${oId}["${oLabel}"]`);
      }
    }
  }

  const mermaidChart = lines.join('\n');
  const markdownContent = `# Observatory Diagram\n\n\`\`\`mermaid\n${mermaidChart}\n\`\`\`\n`;

  const absolutePath = path.isAbsolute(outputPath)
    ? outputPath
    : path.resolve(process.cwd(), outputPath);

  const dir = path.dirname(absolutePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(absolutePath, markdownContent, 'utf8');
  return markdownContent;
}

/**
 * Appends new invariant rules to an AGENTS.md file in a structured manner.
 *
 * @param agentsMdPath - Path to the AGENTS.md file to modify.
 * @param newInvariants - String or array of string invariants to append.
 */
export async function mutateAgentsRules(
  agentsMdPath: string,
  newInvariants: string | string[]
): Promise<void> {
  const invariants = Array.isArray(newInvariants) ? newInvariants : [newInvariants];
  if (invariants.length === 0) return;

  const absolutePath = path.isAbsolute(agentsMdPath)
    ? agentsMdPath
    : path.resolve(process.cwd(), agentsMdPath);

  if (!fs.existsSync(absolutePath)) {
    const parentDir = path.dirname(absolutePath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    const initialContent = `# Invariants\n\n` + invariants.map(inv => `- ${inv}`).join('\n') + '\n';
    fs.writeFileSync(absolutePath, initialContent, 'utf8');
    return;
  }

  let content = fs.readFileSync(absolutePath, 'utf8');

  // Filter out invariants already present to ensure idempotence
  const toAppend = invariants.filter(inv => !content.includes(inv));
  if (toAppend.length === 0) {
    return;
  }

  const lines = content.split(/\r?\n/);
  let invariantsSectionIndex = -1;
  for (const [i, lineRaw] of lines.entries()) {
    const line = lineRaw.trim();
    if (/^#+\s*Invariants\b/i.test(line)) {
      invariantsSectionIndex = i;
      break;
    }
  }

  if (invariantsSectionIndex === -1) {
    // Append the section to the end
    let newSection = '';
    if (content.length > 0 && !content.endsWith('\n')) {
      newSection += '\n';
    }
    newSection += '\n## Invariants\n\n' + toAppend.map(inv => `- ${inv}`).join('\n') + '\n';
    content += newSection;
  } else {
    let insertIndex = lines.length;
    for (let i = invariantsSectionIndex + 1; i < lines.length; i++) {
      const line = lines[i]!.trim();
      if (line.startsWith('#') || line === '---') {
        insertIndex = i;
        break;
      }
    }

    const newLinesToInsert = toAppend.map(inv => `- ${inv}`);

    // Back up to the last non-empty line before the end of the section
    let targetIndex = insertIndex;
    while (targetIndex > invariantsSectionIndex + 1 && lines[targetIndex - 1]!.trim() === '') {
      targetIndex--;
    }

    lines.splice(targetIndex, 0, ...newLinesToInsert);
    content = lines.join('\n');
  }

  fs.writeFileSync(absolutePath, content, 'utf8');
}

/**
 * Normalizes reports/artifacts (walkthroughs) to ensure they accurately reflect actual changes.
 *
 * @param walkthroughPath - Path to the markdown walkthrough/report file to update.
 * @param actualDiffs - Object mapping file paths to their diff strings, or an array of diff objects.
 */
export async function normalizeArtifacts(
  walkthroughPath: string,
  actualDiffs: Record<string, string> | { file: string; diff: string }[]
): Promise<void> {
  const diffsMap: Record<string, string> = {};
  if (Array.isArray(actualDiffs)) {
    for (const d of actualDiffs) {
      diffsMap[d.file] = d.diff;
    }
  } else {
    Object.assign(diffsMap, actualDiffs);
  }

  const absolutePath = path.isAbsolute(walkthroughPath)
    ? walkthroughPath
    : path.resolve(process.cwd(), walkthroughPath);

  let content = '';
  if (fs.existsSync(absolutePath)) {
    content = fs.readFileSync(absolutePath, 'utf8');
  }

  for (const [filePath, diffContent] of Object.entries(diffsMap)) {
    const filename = path.basename(filePath);
    // eslint-disable-next-line no-useless-escape, unicorn/prefer-string-raw
    const escFile = filePath.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    // eslint-disable-next-line no-useless-escape, unicorn/prefer-string-raw
    const escName = filename.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

    // Matches header mentioning full path or just the filename
    const headerRegex = new RegExp(`(^#+\\s+.*(?:${escFile}|${escName}).*)`, 'mi');
    const headerMatch = headerRegex.exec(content);

    if (headerMatch) {
      const headerStartIndex = headerMatch.index;
      const searchRest = content.slice(headerStartIndex + headerMatch[0].length);
      const nextHeaderRegex = /^#+/m;
      const nextHeaderMatch = nextHeaderRegex.exec(searchRest);
      const limitIndex = nextHeaderMatch ? nextHeaderMatch.index : searchRest.length;
      const sectionContent = searchRest.slice(0, limitIndex);

      const codeBlockRegex = /(```(?:diff)?\r?\n)([\s\S]*?)(\r?\n```)/;
      const codeBlockMatch = codeBlockRegex.exec(sectionContent);

      if (codeBlockMatch) {
        const originalCodeBlock = codeBlockMatch[0];
        const newCodeBlock = `${codeBlockMatch[1]}${diffContent.trim()}${codeBlockMatch[3]}`;
        const updatedSection = sectionContent.replace(originalCodeBlock, newCodeBlock);

        const beforeSection = content.slice(0, headerStartIndex + headerMatch[0].length);
        const afterSection = content.slice(headerStartIndex + headerMatch[0].length + limitIndex);
        content = beforeSection + updatedSection + afterSection;
      } else {
        const beforeHeader = content.slice(0, headerStartIndex + headerMatch[0].length);
        const afterHeader = content.slice(headerStartIndex + headerMatch[0].length);
        content = beforeHeader + `\n\n\`\`\`diff\n${diffContent.trim()}\n\`\`\`\n` + afterHeader;
      }
    } else {
      let newSection = '';
      if (content.length > 0 && !content.endsWith('\n')) {
        newSection += '\n';
      }
      newSection += `\n### Changes to \`${filePath}\`\n\n\`\`\`diff\n${diffContent.trim()}\n\`\`\`\n`;
      content += newSection;
    }
  }

  const dir = path.dirname(absolutePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(absolutePath, content, 'utf8');
}
