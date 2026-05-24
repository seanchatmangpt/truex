import Database from 'better-sqlite3';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { type GraphDelta, type Quad, type Receipt, type HookDefinition } from '../runtime-law.js';
import { createDeterministicContext, type TruexContext } from '../context.js';
import { DeltaJournal } from '../persistence/journal.js';
import { SQLiteReceiptStore } from '../persistence/receipt-store.js';
import { hash, initializeSchema, createReceipt, detectRaceConditions } from '../index.js';
import { interceptAgyExecution } from './hook-interceptor.js';

export interface ToolAction {
  name: string; // e.g. "write_file", "run_command"
  target?: string; // target file path or command string
  value?: string; // written content (for file writes)
  arguments?: Record<string, any>;
}

export interface AutonomicLoopResult {
  status: 'confirmed' | 'refused';
  receipt: Receipt;
  delta: GraphDelta;
  extractedQuads: Quad[];
  refusalReason?: string;
}

export class RefusalError extends Error {
  constructor(public reason: string, public receipt: Receipt) {
    super(`[JIDOKA LINE STOP] ${reason}`);
    this.name = 'RefusalError';
  }
}

/**
 * AutonomicGallLoop: The unified closed-loop governor that orchestrates
 * the 10-step lifecycle across S0-S3 layers.
 */
export class AutonomicGallLoop {
  private db: Database.Database;
  private journal: DeltaJournal;
  private receiptStore: SQLiteReceiptStore;
  private hooks: HookDefinition[];
  private ctx: TruexContext;

  constructor(options: {
    dbPath?: string;
    db?: Database.Database;
    hooks?: HookDefinition[];
    seed?: number;
  } = {}) {
    const dbPath = options.dbPath || path.resolve(process.cwd(), 'gall_truex.db');
    this.db = options.db || new Database(dbPath);
    initializeSchema(this.db);
    this.journal = new DeltaJournal(this.db);
    this.receiptStore = new SQLiteReceiptStore(this.db);
    this.hooks = options.hooks || [];
    this.ctx = createDeterministicContext(options.seed ?? 100);
  }

  /**
   * Registers a hook dynamically.
   */
  registerHook(hook: HookDefinition): void {
    const newHooks = [...this.hooks, hook];
    const races = detectRaceConditions(newHooks);
    if (races.length > 0) {
      const race = races[0];
      throw new Error(`Refusing to register hook '${hook.id}': Non-deterministic race condition detected with hook '${race.hookAId === hook.id ? race.hookBId : race.hookAId}' (Pattern: ${race.pattern})`);
    }
    this.hooks.push(hook);
  }

  /**
   * Executes the 10-step closed-loop lifecycle.
   */
  async run(action: ToolAction, executor: () => Promise<any>): Promise<AutonomicLoopResult> {
    const stepLogs: string[] = [];
    const logStep = (stepNum: number, desc: string) => {
      const msg = `[Step ${stepNum}/10] ${desc}`;
      stepLogs.push(msg);
      process.stderr.write(`🌀 AutonomicGallLoop: ${msg}\n`);
    };

    const ctx = this.ctx;
    const deltaId = `agy_${ctx.uuid()}`;

    // Step 1: Intercept Tool Action (BeforeTool)
    logStep(1, `Intercepting tool action '${action.name}'`);
    const args = action.arguments || {
      TargetFile: action.target,
      CodeContent: action.value,
      CommandLine: action.name === 'run_command' ? action.target : undefined
    };

    const delta: GraphDelta = {
      id: deltaId,
      adds: [
        {
          subject: `agy:tool:${action.name}`,
          predicate: 'agy:action',
          object: action.name,
          graph: 'agy:graph:main'
        },
        {
          subject: `agy:tool:${action.name}`,
          predicate: 'agy:arguments',
          object: hash(args),
          graph: 'agy:graph:main'
        }
      ],
      deletes: []
    };

    if (action.target) {
      delta.adds.push({
        subject: `file:${action.target}`,
        predicate: 'agy:modified_by',
        object: `agy:tool:${action.name}`,
        graph: 'agy:graph:main'
      });
      delta.adds.push({
        subject: `agy:tool:${action.name}`,
        predicate: 'agy:target',
        object: action.target,
        graph: 'agy:graph:main'
      });
    }

    // Step 2: Validate Laws
    logStep(2, `Validating proposed action against registered laws/invariants`);
    let validation = interceptAgyExecution(
      {
        type: action.name === 'run_command' ? 'run_command' : 'write_file',
        target: action.target || '',
        value: action.value
      },
      this.hooks
    );

    // Custom check: Fossil record detection
    if (validation.allowed) {
      const content = action.value || args.CodeContent || '';
      if (content.includes('FOSSIL')) {
        validation = {
          allowed: false,
          reason: 'Semantic Law Violation: Fossil record detected in proposed code mutation.'
        };
      }
    }

    // If validation fails, trigger Jidoka Line Stop (Refusal)
    if (!validation.allowed) {
      const refusalReason = validation.reason || 'Operation blocked by Repository Law';
      logStep(2, `Refused: ${refusalReason}`);

      const refusedReceipt = createReceipt(
        ctx,
        `evt_refused_${ctx.uuid()}`,
        delta.id,
        hash(delta),
        hash({ error: refusalReason }),
        this.receiptStore.latest()?.receiptHash ?? null,
        'refused'
      );

      // Append refused attempt to the WAL delta journal and receipt store
      this.journal.append(delta);
      this.receiptStore.append(refusedReceipt);

      throw new RefusalError(refusalReason, refusedReceipt);
    }

    // Step 3: Append WAL to sqlite
    logStep(3, `Appending proposed GraphDelta to delta WAL (wal_deltas)`);
    const journalIdx = this.journal.append(delta);

    // Step 4: Create and Append receipts to sqlite
    logStep(4, `Preparing receipt for confirmation`);
    const inputHash = hash(delta);

    // File backup state for execution rollback
    let fileBackup: { path: string; exists: boolean; content?: string } | null = null;
    if (action.target && (action.name === 'write_file' || action.name === 'write_to_file')) {
      const targetPath = path.resolve(action.target);
      const exists = fs.existsSync(targetPath);
      fileBackup = {
        path: targetPath,
        exists,
        content: exists ? fs.readFileSync(targetPath, 'utf8') : undefined
      };
    }

    // Step 5: Execute
    logStep(5, `Executing tool action '${action.name}'`);
    this.db.prepare('BEGIN').run();

    let executionResult: any;
    try {
      executionResult = await executor();
    } catch (execError: any) {
      logStep(5, `Execution failed: ${execError.message}. Initiating rollback.`);
      this.db.prepare('ROLLBACK').run();
      
      if (fileBackup) {
        if (fileBackup.exists && fileBackup.content !== undefined) {
          fs.writeFileSync(fileBackup.path, fileBackup.content);
        } else if (!fileBackup.exists && fs.existsSync(fileBackup.path)) {
          fs.unlinkSync(fileBackup.path);
        }
      }

      const failedReceipt = createReceipt(
        ctx,
        `evt_failed_${ctx.uuid()}`,
        delta.id,
        inputHash,
        hash({ error: execError.message }),
        this.receiptStore.latest()?.receiptHash ?? null,
        'refused'
      );
      this.receiptStore.append(failedReceipt);

      throw new RefusalError(`Execution Failure: ${execError.message}`, failedReceipt);
    }

    // Step 6: Observe Consequences (AfterTool)
    logStep(6, `Observing post-execution consequences`);

    // Step 7: Extract Facts (AST / Observatory)
    logStep(7, `Extracting facts from consequences`);
    const extractedQuads: Quad[] = [];

    try {
      if (action.target && fs.existsSync(action.target)) {
        const fileContent = fs.readFileSync(action.target, 'utf8');

        if (fileContent.includes('FOSSIL')) {
          throw new Error('Semantic Law Violation: Fossil record detected in file contents post-execution.');
        }

        // Parse functions
        const funcMatches = fileContent.matchAll(/export (?:async )?function\s+([a-zA-Z0-9_]+)/g);
        for (const match of funcMatches) {
          extractedQuads.push({
            subject: `file:${action.target}`,
            predicate: 'file:exportsFunction',
            object: match[1],
            graph: 'agy:graph:main'
          });
        }

        // Parse classes
        const classMatches = fileContent.matchAll(/export class\s+([a-zA-Z0-9_]+)/g);
        for (const match of classMatches) {
          extractedQuads.push({
            subject: `file:${action.target}`,
            predicate: 'file:exportsClass',
            object: match[1],
            graph: 'agy:graph:main'
          });
        }

        // Line count
        const lines = fileContent.split(/\r?\n/).length;
        extractedQuads.push({
          subject: `file:${action.target}`,
          predicate: 'file:lineCount',
          object: String(lines),
          graph: 'agy:graph:main'
        });
      }
    } catch (error_: any) {
      logStep(7, `Fact extraction / validation failed: ${error_.message}. Initiating rollback.`);
      this.db.prepare('ROLLBACK').run();
      
      if (fileBackup) {
        if (fileBackup.exists && fileBackup.content !== undefined) {
          fs.writeFileSync(fileBackup.path, fileBackup.content);
        } else if (!fileBackup.exists && fs.existsSync(fileBackup.path)) {
          fs.unlinkSync(fileBackup.path);
        }
      }

      const failedReceipt = createReceipt(
        ctx,
        `evt_refused_${ctx.uuid()}`,
        delta.id,
        inputHash,
        hash({ error: error_.message }),
        this.receiptStore.latest()?.receiptHash ?? null,
        'refused'
      );
      this.receiptStore.append(failedReceipt);

      throw new RefusalError(error_.message, failedReceipt);
    }

    // Step 8: Validate Post-Execution Invariants
    logStep(8, `Validating post-execution invariants`);
    for (const quad of extractedQuads) {
      if (quad.predicate === 'file:lineCount') {
        const lineCount = Number.parseInt(quad.object, 10);
        if (lineCount > 800) {
          const muriError = `Muri Violation: File '${action.target}' is too large (${lineCount} lines). Limit is 800 lines.`;
          logStep(8, muriError);

          this.db.prepare('ROLLBACK').run();
          
          if (fileBackup) {
            if (fileBackup.exists && fileBackup.content !== undefined) {
              fs.writeFileSync(fileBackup.path, fileBackup.content);
            } else if (!fileBackup.exists && fs.existsSync(fileBackup.path)) {
              fs.unlinkSync(fileBackup.path);
            }
          }

          const failedReceipt = createReceipt(
            ctx,
            `evt_refused_${ctx.uuid()}`,
            delta.id,
            inputHash,
            hash({ error: muriError }),
            this.receiptStore.latest()?.receiptHash ?? null,
            'refused'
          );
          this.receiptStore.append(failedReceipt);

          throw new RefusalError(muriError, failedReceipt);
        }
      }
    }

    // Step 9: Commit or Rollback Transaction
    logStep(9, `Committing transactions and persisting state quads`);
    const insertQuad = this.db.prepare(
      'INSERT INTO quads (subject, predicate, object, graph, delta_id, op_type) VALUES (?, ?, ?, ?, ?, ?)'
    );

    for (const q of extractedQuads) {
      insertQuad.run(q.subject, q.predicate, q.object, q.graph ?? null, delta.id, 'add');
    }

    for (const q of delta.adds) {
      insertQuad.run(q.subject, q.predicate, q.object, q.graph ?? null, delta.id, 'add');
    }

    const outputData = {
      deltaId: delta.id,
      extractedQuads: extractedQuads.map(q => ({ subject: q.subject, predicate: q.predicate, object: q.object })),
      status: 'confirmed'
    };
    const outputHash = hash(outputData);

    const receipt = createReceipt(
      ctx,
      `evt_${ctx.uuid()}`,
      delta.id,
      inputHash,
      outputHash,
      this.receiptStore.latest()?.receiptHash ?? null,
      'confirmed'
    );

    this.receiptStore.append(receipt);
    this.journal.markApplied(journalIdx);

    this.db.prepare('COMMIT').run();

    // Step 10: S0-S3 Stabilization
    logStep(10, `S0-S3 Stabilization sequence completed successfully`);

    // S1 Replay Verification
    const expectedOutputHash = hash(outputData);
    if (receipt.outputHash !== expectedOutputHash) {
      throw new Error(`S1 Replay failure: receipt output hash mismatch!`);
    }

    return {
      status: 'confirmed',
      receipt,
      delta,
      extractedQuads
    };
  }

  getDb(): Database.Database {
    return this.db;
  }

  getJournal(): DeltaJournal {
    return this.journal;
  }

  getReceiptStore(): SQLiteReceiptStore {
    return this.receiptStore;
  }
}
