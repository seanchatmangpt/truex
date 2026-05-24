import { readFileSync, writeFileSync } from 'fs';

const p = 'packages/truex-core/src/ocpq-project-constraints.gall.ts';
let content = readFileSync(p, 'utf-8');

// Replace standard project constraints library array
// and evaluateProjectConstraint function.

