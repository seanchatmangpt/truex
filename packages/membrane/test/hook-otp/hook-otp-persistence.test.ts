import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import {
  createHookOtpRuntime,
  createHookProcess,
  createHookSupervisor,
  dispatchMessage,
  recoverProcess,
  persistProcess,
  saveProcessState,
  saveMailboxMessage,
  removeMailboxMessage,
  initializeOtpSchema
} from '../../src/hook-otp.gall.js';

describe('Hook OTP SQLite Persistence', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(':memory:');
  });

  afterEach(() => {
    db.close();
  });

  it('should initialize tables in the database', () => {
    const runtime = createHookOtpRuntime(12345, db);
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[];
    const tableNames = tables.map(t => t.name);

    expect(tableNames).toContain('hook_processes');
    expect(tableNames).toContain('hook_mailbox');
  });

  it('should persist process state and mailbox message on dispatch', () => {
    const runtime = createHookOtpRuntime(12345, db);
    const p1 = createHookProcess('p1', (state, msg) => {
      return { nextState: { value: (state.value || 0) + msg.payload.amount }, effects: [] };
    }, { value: 10 });

    runtime.processes.set('p1', p1);

    // Initial persistence
    persistProcess(runtime, p1);

    const procRowBefore = db.prepare('SELECT * FROM hook_processes WHERE id = ?').get('p1') as any;
    expect(procRowBefore).toBeDefined();
    expect(JSON.parse(procRowBefore.state)).toEqual({ value: 10 });
    expect(procRowBefore.restart_count).toBe(0);

    // Let's test that saveMailboxMessage puts a message in the DB
    const testMsg = {
      id: 'msg1',
      targetProcessId: 'p1',
      delta: { id: 'd1', adds: [], deletes: [] },
      payload: { amount: 5 }
    };
    saveMailboxMessage(db, testMsg);
    const msgRowBefore = db.prepare('SELECT * FROM hook_mailbox WHERE id = ?').get('msg1') as any;
    expect(msgRowBefore).toBeDefined();
    expect(msgRowBefore.target_process_id).toBe('p1');
    expect(JSON.parse(msgRowBefore.payload_json)).toEqual({ amount: 5 });

    // Dispatch message (it will pop and therefore remove from mailbox)
    const res = dispatchMessage(runtime, testMsg);

    expect(res.allowed).toBe(true);

    // Check process state in DB
    const procRowAfter = db.prepare('SELECT * FROM hook_processes WHERE id = ?').get('p1') as any;
    expect(JSON.parse(procRowAfter.state)).toEqual({ value: 15 });

    // Check message in DB was removed upon pop
    const msgRowAfter = db.prepare('SELECT * FROM hook_mailbox WHERE id = ?').get('msg1') as any;
    expect(msgRowAfter).toBeUndefined();
  });

  it('should persist supervisor crash updates', () => {
    const runtime = createHookOtpRuntime(12345, db);
    const supervisor = createHookSupervisor('sup1', { maxRestarts: 2, withinMs: 5000 });
    runtime.supervisors.set('sup1', supervisor);

    const p1 = createHookProcess('p1', (state, msg) => {
      if (msg.payload?.crash) {
        throw new Error('Boom');
      }
      return { nextState: { value: (state.value || 0) + 1 }, effects: [] };
    }, { value: 100 });

    p1.supervisorId = 'sup1';
    runtime.processes.set('p1', p1);
    supervisor.processes.set('p1', p1);
    supervisor.initialStates.set('p1', { value: 100 });

    persistProcess(runtime, p1);

    // Dispatch crashing message
    const res = dispatchMessage(runtime, {
      id: 'msg-crash',
      targetProcessId: 'p1',
      delta: { id: 'd-crash', adds: [], deletes: [] },
      payload: { crash: true }
    });

    expect(res.allowed).toBe(false);

    // Check process state in DB after crash & rollback
    const procRow = db.prepare('SELECT * FROM hook_processes WHERE id = ?').get('p1') as any;
    expect(JSON.parse(procRow.state)).toEqual({ value: 100 }); // rolled back to init state
    expect(procRow.restart_count).toBe(1);
    expect(procRow.is_halted).toBe(0);
  });

  it('should recover process state and queue from the database', () => {
    // Phase 1: Set up first runtime, enqueue messages, persist them
    const runtime1 = createHookOtpRuntime(12345, db);
    const p1 = createHookProcess('p1', (state, msg) => {
      return { nextState: { value: (state.value || 0) + msg.payload.amount }, effects: [] };
    }, { value: 50 });

    runtime1.processes.set('p1', p1);
    persistProcess(runtime1, p1);

    // Insert queued messages into the database manually to simulate backlog in mailbox
    db.prepare(`
      INSERT INTO hook_mailbox (id, target_process_id, delta_json, sender_id, payload_json, expiration, queued_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run('msg-q1', 'p1', JSON.stringify({ id: 'd2', adds: [], deletes: [] }), null, JSON.stringify({ amount: 10 }), null, Date.now() - 1000);

    db.prepare(`
      INSERT INTO hook_mailbox (id, target_process_id, delta_json, sender_id, payload_json, expiration, queued_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run('msg-q2', 'p1', JSON.stringify({ id: 'd3', adds: [], deletes: [] }), null, JSON.stringify({ amount: 20 }), null, Date.now());

    // Phase 2: Create a fresh runtime representing a restarted process instance
    const runtime2 = createHookOtpRuntime(12345, db);
    
    // Recover process p1
    const behavior = (state: any, msg: any) => {
      return { nextState: { value: (state.value || 0) + msg.payload.amount }, effects: [] };
    };

    const recoveredProc = recoverProcess(runtime2, 'p1', behavior);
    expect(recoveredProc).toBeDefined();
    expect(recoveredProc?.id).toBe('p1');
    expect(recoveredProc?.state).toEqual({ value: 50 });
    expect(recoveredProc?.mailbox.size()).toBe(2);

    // Process the recovered queue
    const popped1 = recoveredProc?.mailbox.pop();
    expect(popped1?.id).toBe('msg-q1');
    expect(popped1?.payload.amount).toBe(10);

    const popped2 = recoveredProc?.mailbox.pop();
    expect(popped2?.id).toBe('msg-q2');
    expect(popped2?.payload.amount).toBe(20);
  });
});
