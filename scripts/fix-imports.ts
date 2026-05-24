import * as fs from 'node:fs';
import * as path from 'node:path';

const examplesDir = path.join(process.cwd(), 'examples/reactive');
const docsPath = path.join(process.cwd(), 'docs/reactive-patterns.md');

const files = fs.readdirSync(examplesDir).filter(f => f.endsWith('.ts') && !f.endsWith('.test.ts'));

for (const file of files) {
  const filePath = path.join(examplesDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // Ensure import is at the top
  if (!content.includes("import { fileURLToPath } from 'node:url';")) {
    content = "import { fileURLToPath } from 'node:url';\n" + content;
  }

  fs.writeFileSync(filePath, content);
}
console.log('Fixed imports');
