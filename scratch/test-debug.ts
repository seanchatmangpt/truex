import { evaluateProjectConstraint, PROJECT_CONSTRAINTS } from '../packages/truex-core/src/ocpq-project-constraints.gall.js';

const log = {
  eventTypes: [],
  objectTypes: [],
  events: [],
  objects: [
    {
      id: 'file_index.ts',
      type: 'source_file',
      attributes: [],
      relationships: []
    }
  ]
} as any;

const c = PROJECT_CONSTRAINTS.find(c => c.id === 'c-proof-command-missing')!;
console.log('Constraint:', JSON.stringify(c, null, 2));
const v = evaluateProjectConstraint(c, log);
console.log('Result length:', v.length);
console.log('Result:', v);
