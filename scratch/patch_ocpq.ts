import { readFileSync, writeFileSync } from 'node:fs';

const p = 'packages/membrane/src/ocpq-project-constraints.gall.ts';
const content = readFileSync(p, 'utf-8');

// Replace standard project constraints library array
// and evaluateProjectConstraint function.

