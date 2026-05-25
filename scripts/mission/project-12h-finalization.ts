/**
 * @module scripts/mission/project-12h-finalization
 * @description
 * Gall S11 Project 12H finalization verification runner.
 */

import { execSync } from 'node:child_process';
import * as path from 'node:path';
import * as fs from 'node:fs';

function runCmd(cmd: string): { success: boolean; output: string } {
  console.log(`Running: ${cmd}`);
  try {
    const out = execSync(cmd, { stdio: 'pipe', env: { ...process.env, TSX_DISABLE_CACHE: '1' } }).toString();
    return { success: true, output: out };
  } catch (error_: any) {
    const out = error_.stdout?.toString() || error_.stderr?.toString() || error_.message;
    return { success: false, output: out };
  }
}

async function main() {
  console.log("🏁 Starting S11 Project 12-Hour Finalization script...");
  const start = Date.now();

  // 1. Run full unit/integration test suite
  const testRes = runCmd('npx vitest run');
  if (!testRes.success) {
    console.error("❌ Vitest suite failed:\n", testRes.output);
    process.exit(1);
  }
  console.log("✅ Vitest suite passed.");

  // 2. Run doctor prove wizard validation
  const wizardRes = runCmd('TSX_DISABLE_CACHE=1 npx tsx scripts/truex.ts doctor prove wizard');
  if (!wizardRes.success) {
    console.error("❌ Doctor prove wizard validation failed:\n", wizardRes.output);
    process.exit(1);
  }
  console.log("✅ Doctor prove wizard validation passed.");

  // 3. Run doctor prove ecosystem
  const ecosystemRes = runCmd('TSX_DISABLE_CACHE=1 npx tsx scripts/truex.ts doctor prove ecosystem');
  if (!ecosystemRes.success) {
    console.error("❌ Doctor prove ecosystem failed:\n", ecosystemRes.output);
    process.exit(1);
  }
  console.log("✅ Doctor prove ecosystem passed.");

  console.log(`🎉 12H Finalization verified successfully in ${((Date.now() - start) / 1000).toFixed(2)} seconds!`);
}

main().catch(error_ => {
  console.error(error_);
  process.exit(1);
});
