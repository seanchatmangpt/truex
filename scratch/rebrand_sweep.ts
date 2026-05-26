import * as fs from 'node:fs';
import * as path from 'node:path';

function walkDir(dir: string, callback: (filePath: string) => void) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (
        file !== 'node_modules' &&
        file !== '.git' &&
        file !== 'dist' &&
        file !== 'target' &&
        file !== '.generated' &&
        file !== '.cache' &&
        file !== '.antigravitycli' &&
        file !== '.truex' &&
        file !== 'coverage' &&
        file !== '.idea'
      ) {
        walkDir(filePath, callback);
      }
    } else {
      callback(filePath);
    }
  }
}

function runSweep() {
  console.log('🏁 Starting Unified Rebranding Sweep...');

  let changedCount = 0;

  walkDir(process.cwd(), (filePath) => {
    const ext = path.extname(filePath);
    const base = path.basename(filePath);

    // Skip lockfiles, compiled logs, binary files, and the script itself
    if (
      base === 'pnpm-lock.yaml' ||
      base === 'package-lock.json' ||
      filePath.includes('scratch/rebrand_sweep.ts') ||
      filePath.includes('.wasm4pm/agents/audit.jsonl') ||
      ext === '.png' || ext === '.jpg' || ext === '.wasm' || ext === '.db' || ext === '.db-shm' || ext === '.db-wal'
    ) {
      return;
    }

    // Process matching text file types
    if (!['.ts', '.js', '.json', '.sh', '.toml', '.md', '.rs', '.txt'].includes(ext) && base !== 'pnpm-workspace.yaml') {
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;

    content = content.replace(/wasm4pm_types/g, 'truex_kernel_types');
    content = content.replace(/wasm4pm_algos/g, 'truex_kernel_algos');
    content = content.replace(/wasm4pm_cognition/g, 'truex_kernel_cognition');
    content = content.replace(/wasm4pm_macros/g, 'truex_kernel_macros');
    content = content.replace(/wasm4pm_utils/g, 'truex_kernel_utils');
    content = content.replace(/wasm4pm_cli/g, 'truex_kernel_cli');
    if (ext === '.rs') {
      content = content.replace(/\bwasm4pm\b/g, 'truex_kernel');
    }

    // 2. Cryptographic derived domains in Rust
    content = content.replace(/wasm4pm\.recpt\.v2/g, 'truex.recpt.v2');
    content = content.replace(/wasm4pm\.identity\.v2/g, 'truex.identity.v2');

    // 3. Config files & config dirs
    content = content.replace(/\.wasm4pm/g, '.truex');
    content = content.replace(/wasm4pm\.toml/g, 'truex.toml');
    content = content.replace(/wasm4pm\.json/g, 'truex.json');

    // 4. TS Package Scope Replacements
    content = content.replace(/@wasm4pm\/agents/g, '@truex/agents');
    content = content.replace(/@wasm4pm\/supabase/g, '@truex/supabase');
    content = content.replace(/@wasm4pm\/kernel/g, '@truex/kernel');
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
    content = content.replace(/@wasm4pm\/cli/g, '@truex/cli');
    content = content.replace(/@wasm4pm\/generated/g, '@truex/generated');
    content = content.replace(/@wasm4pm\/pm4wasm/g, '@truex/process-intelligence');
    content = content.replace(/@wasm4pm\/templates/g, '@truex/templates');

    // Cargo crate renames (fallback for missed Cargo settings)
    content = content.replace(/name = "wasm4pm"/g, 'name = "truex-kernel"');
    content = content.replace(/name = "wasm4pm-algos"/g, 'name = "truex-kernel-algos"');
    content = content.replace(/name = "wasm4pm-types"/g, 'name = "truex-kernel-types"');
    content = content.replace(/name = "wasm4pm-cli"/g, 'name = "truex-kernel-cli"');
    content = content.replace(/name = "wasm4pm-utils"/g, 'name = "truex-kernel-utils"');
    content = content.replace(/name = "wasm4pm-cognition"/g, 'name = "truex-kernel-cognition"');
    content = content.replace(/name = "wasm4pm-macros"/g, 'name = "truex-kernel-macros"');

    // 5. WASM bundle renames
    // e.g. wasm4pm.js -> truex_kernel.js, wasm4pm_bg.wasm -> truex_kernel_bg.wasm
    content = content.replace(/wasm4pm\.js/g, 'truex_kernel.js');
    content = content.replace(/wasm4pm_bg\.wasm/g, 'truex_kernel_bg.wasm');
    content = content.replace(/wasm4pm\.d\.ts/g, 'truex_kernel.d.ts');
    content = content.replace(/wasm4pm_cognition/g, 'truex_kernel_cognition');

    // Scope names and CLI commands
    content = content.replace(/"name": "wasm4pm"/g, '"name": "@truex/kernel"');
    content = content.replace(/'wasm4pm'/g, "'@truex/kernel'");
    content = content.replace(/"wasm4pm"/g, '"@truex/kernel"');
    content = content.replace(/wasm4pm-wasm/g, 'kernel-wasm');
    content = content.replace(/@truex\/wasm4pm-wasm/g, '@truex/kernel-wasm');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      changedCount++;
      console.log(`Rebranded: ${path.relative(process.cwd(), filePath)}`);
    }
  });

  console.log(`✅ Sweep complete. Modified ${changedCount} files.`);
}

runSweep();
