import * as fs from 'node:fs';
import * as path from 'node:path';

function walkDir(dir: string, callback: (filePath: string) => void) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist' && file !== 'target') {
        walkDir(filePath, callback);
      }
    } else {
      callback(filePath);
    }
  }
}

function rebrandFiles() {
  console.log('🚀 Starting Truex Rebranding Sweep...');

  // 1. Rename directories
  const dirRenames = [
    { from: 'packages/truex-core', to: 'packages/membrane' },
    { from: 'packages/kernel-wasm', to: 'packages/kernel-wasm' },
    { from: 'crates/wasm4pm', to: 'crates/truex-kernel' },
    { from: 'crates/wasm4pm-types', to: 'crates/truex-kernel-types' },
    { from: 'crates/wasm4pm-algos', to: 'crates/truex-kernel-algos' },
    { from: 'crates/wasm4pm-cli', to: 'crates/truex-kernel-cli' },
    { from: 'crates/wasm4pm-utils', to: 'crates/truex-kernel-utils' },
    { from: 'crates/wasm4pm-cognition', to: 'crates/truex-kernel-cognition' },
    { from: 'crates/wasm4pm-macros', to: 'crates/truex-kernel-macros' },
  ];

  for (const rename of dirRenames) {
    const fromPath = path.resolve(process.cwd(), rename.from);
    const toPath = path.resolve(process.cwd(), rename.to);
    if (fs.existsSync(fromPath)) {
      console.log(`Renaming folder ${rename.from} -> ${rename.to}`);
      fs.renameSync(fromPath, toPath);
    }
  }

  // 2. Perform text replacement across all files
  walkDir(process.cwd(), (filePath) => {
    const ext = path.extname(filePath);
    const base = path.basename(filePath);

    // Only process source files, configs, and shell scripts
    if (!['.ts', '.js', '.json', '.sh', '.toml', '.md'].includes(ext) && base !== 'pnpm-workspace.yaml') {
      return;
    }

    // Skip scratch scripts
    if (filePath.includes('scratch/rebrand.ts')) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Apply replacements
    // Package scope replacements
    content = content.replace(/@wasm4pm\/contracts/g, '@truex/contracts');
    content = content.replace(/@wasm4pm\/config/g, '@truex/config');
    content = content.replace(/@wasm4pm\/engine/g, '@truex/engine');
    content = content.replace(/@wasm4pm\/observability/g, '@truex/observability');
    content = content.replace(/@wasm4pm\/planner/g, '@truex/planner');
    content = content.replace(/@wasm4pm\/ml/g, '@truex/ml');
    content = content.replace(/@wasm4pm\/core/g, '@truex/core');
    content = content.replace(/@wasm4pm\/swarm/g, '@truex/swarm');
    content = content.replace(/@wasm4pm\/cognition/g, '@truex/cognition');
    content = content.replace(/@wasm4pm\/testing/g, '@truex/testing');

    content = content.replace(/"name": "@truex/kernel"/g, '"name": "@truex/kernel"');
    content = content.replace(/'@truex/kernel'/g, "'@truex/kernel'");
    content = content.replace(/"@truex/kernel"/g, '"@truex/kernel"');
    content = content.replace(/wasm4pm\/pkg/g, '@truex/kernel-wasm/pkg');

    content = content.replace(/@truex\/kernel-wasm/g, '@truex/kernel-wasm');
    content = content.replace(/@truex\/core/g, '@truex/membrane');
    content = content.replace(/truex-core/g, 'membrane');
    content = content.replace(/kernel-wasm/g, 'kernel-wasm');

    // Cargo.toml replacements
    content = content.replace(/name = "truex-kernel"/g, 'name = "truex-kernel"');
    content = content.replace(/name = "truex-kernel-algos"/g, 'name = "truex-kernel-algos"');
    content = content.replace(/name = "truex-kernel-types"/g, 'name = "truex-kernel-types"');
    content = content.replace(/name = "truex-kernel-cli"/g, 'name = "truex-kernel-cli"');
    content = content.replace(/name = "truex-kernel-utils"/g, 'name = "truex-kernel-utils"');
    content = content.replace(/name = "truex-kernel-cognition"/g, 'name = "truex-kernel-cognition"');
    content = content.replace(/name = "truex-kernel-macros"/g, 'name = "truex-kernel-macros"');

    content = content.replace(/path = "@truex/kernel"/g, 'path = "crates/truex-kernel"');
    content = content.replace(/path = "crates\/wasm4pm/g, 'path = "crates/truex-kernel');
    content = content.replace(/path = "\.\.\/crates\/wasm4pm/g, 'path = "../truex-kernel');
    content = content.replace(/path = "\.\.\/wasm4pm/g, 'path = "../truex-kernel');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Rebranded content in: ${path.relative(process.cwd(), filePath)}`);
    }
  });

  console.log('✅ Rebranding Sweep Complete!');
}

rebrandFiles();
