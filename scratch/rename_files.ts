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
        // Callback on the directory itself (post-order so we rename children first)
        walkDir(filePath, callback);
        callback(filePath);
      }
    } else {
      callback(filePath);
    }
  }
}

function runRename() {
  console.log('📂 Starting Disk Renaming Sweep...');

  const targets: string[] = [];
  walkDir(process.cwd(), (filePath) => {
    targets.push(filePath);
  });

  // Sort targets by depth descending to rename files/subdirs before parents
  targets.sort((a, b) => b.split(path.sep).length - a.split(path.sep).length);

  let renamedCount = 0;

  for (const target of targets) {
    if (!fs.existsSync(target)) continue;

    const base = path.basename(target);
    const dir = path.dirname(target);
    let newBase = base;

    if (base === '.truex') {
      newBase = '.truex';
    } else if (base === 'truex.toml') {
      newBase = 'truex.toml';
    } else if (base === 'truex.json') {
      newBase = 'truex.json';
    } else if (base.startsWith('truex_kernel_cognition')) {
      newBase = base.replace('truex_kernel_cognition', 'truex_kernel_cognition');
    } else if (base.startsWith('@truex/kernel')) {
      newBase = base.replace('@truex/kernel', 'truex_kernel');
    }

    if (newBase !== base) {
      const newPath = path.join(dir, newBase);
      fs.renameSync(target, newPath);
      renamedCount++;
      console.log(`Renamed: ${path.relative(process.cwd(), target)} -> ${newBase}`);
    }
  }

  console.log(`✅ Renaming sweep complete. Renamed ${renamedCount} items.`);
}

runRename();
