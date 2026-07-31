import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  admitTruexControlPlaneBblock,
  type GgenBblockPlan,
  type GgenBblockReceipt,
} from '../packages/storehouse/src/ggen-bblock.js';

function argument(name: string): string {
  const index = process.argv.indexOf(name);
  const value = index >= 0 ? process.argv[index + 1] : undefined;
  if (!value) throw new Error(`Missing required argument ${name}`);
  return resolve(process.cwd(), value);
}

async function load<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, 'utf8')) as T;
}

async function main(): Promise<void> {
  const planPath = argument('--plan');
  const intentPath = argument('--intent');
  const resultPath = argument('--result');

  const [plan, intent, result] = await Promise.all([
    load<GgenBblockPlan>(planPath),
    load<GgenBblockReceipt>(intentPath),
    load<GgenBblockReceipt>(resultPath),
  ]);

  const admission = admitTruexControlPlaneBblock(plan, intent, result);
  console.log(JSON.stringify(admission, undefined, 2));
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
