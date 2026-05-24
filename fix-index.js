import fs from 'fs';

const indexPath = 'packages/truex-core/src/index.ts';
let content = fs.readFileSync(indexPath, 'utf8');

// The lines we want to replace are between `from "./ocel2-project-types.js";`
// we'll replace the ones we changed
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

const startIdx = content.indexOf('// Explicit type-only exports for non-conflicting types in ocel2-project-types.ts');
if (startIdx !== -1) {
  let firstPart = content.slice(0, startIdx);
  let secondPart = content.slice(startIdx);
  for (const { old, new: newName } of replacements) {
    const regex = new RegExp(`\\b${old}\\b`, 'g');
    secondPart = secondPart.replace(regex, newName);
  }
  fs.writeFileSync(indexPath, firstPart + secondPart);
  console.log('Fixed index.ts successfully.');
}
