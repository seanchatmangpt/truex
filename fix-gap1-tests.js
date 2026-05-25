import fs from 'node:fs';
import path from 'node:path';

const filesToUpdate = [
  'packages/membrane/src/index.ts',
  'packages/membrane/test/project-evidence/ocel2-type-boundary-gap.test.ts',
  'packages/membrane/test/project-evidence/ocel2-projection-gap.test.ts',
];

const replacements = [
  { old: 'ProjectCell', new: 'BoundaryProjectCell' },
  { old: 'GallCheckpoint', new: 'BoundaryGallCheckpoint' },
  { old: 'PowlActivity', new: 'BoundaryPowlActivity' },
  { old: 'PowlSilent', new: 'BoundaryPowlSilent' },
  { old: 'PowlPartialOrder', new: 'BoundaryPowlPartialOrder' },
  { old: 'PowlChoiceGraph', new: 'BoundaryPowlChoiceGraph' },
  { old: 'PowlNode', new: 'BoundaryPowlNode' },
  { old: 'PowlNodeId', new: 'BoundaryPowlNodeId' },
  { old: 'PowlChoiceEdge', new: 'BoundaryPowlChoiceEdge' },
  { old: 'PowlOrderEdge', new: 'BoundaryPowlOrderEdge' }
];

for (const file of filesToUpdate) {
  let content = fs.readFileSync(file, 'utf8');
  for (const { old, new: newName } of replacements) {
    // Word boundary regex
    const regex = new RegExp(`\\b${old}\\b`, 'g');
    content = content.replace(regex, newName);
  }
  
  if (file.endsWith('ocel2-projection-gap.test.ts')) {
    content = content.replace(
      /log\.events\[0\]\.relationships\.push\(/,
      '(log.events[0].relationships as any[]).push('
    );
    content = content.replace(
      /log\.events\[0\]\.relationships\.splice\(/g,
      '(log.events[0].relationships as any[]).splice('
    );
    content = content.replace(
      /terminalEvent\.relationships\.push\(/g,
      '(terminalEvent.relationships as any[]).push('
    );
  }

  fs.writeFileSync(file, content);
  console.log(`Processed ${file}`);
}
