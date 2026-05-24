import fs from 'fs';
import path from 'path';

const basePath = 'packages/truex-core/src';

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

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  for (const { old, new: newName } of replacements) {
    // Word boundary regex
    const regex = new RegExp(`\\b${old}\\b`, 'g');
    content = content.replace(regex, newName);
  }
  fs.writeFileSync(filePath, content);
  console.log(`Processed ${filePath}`);
}

processFile(path.join(basePath, 'ocel2-project-types.ts'));
processFile(path.join(basePath, 'ocel2-project-projection.gall.ts'));

// Update index.ts to export Boundary* if they were exported, actually the exported GallCheckpointAccounting uses BoundaryGallCheckpoint? No, let's see index.ts manually.
