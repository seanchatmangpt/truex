import { describe, it, expect } from 'vitest';
import crypto from 'node:crypto';
import {
  projectReportToOcel,
  mailboxReportToOcel,
  wizardCommandToOcelEvent,
  receiptToOcelObject,
  checkpointToOcelObject,
  proofCommandToOcelEvent
} from '../../src/ocel2-project-projection.gall.js';
import type { 
  WizardProjectReport, 
  PersistentMailboxMessage, 
  OcelId, 
  ProjectPath, 
  ISODateTime,
  Hash256
} from '../../src/ocel2-project-types.js';

describe('OCEL2 Project Projection', () => {

  const mockReport: WizardProjectReport = {
    case: 'truex-project-wizard',
    status: 'passed',
    projectCell: {
      projectId: 'proj_123' as any,
      root: '/mock/root' as any,
      truexDir: '/mock/truex' as any,
      receiptsDir: '/mock/receipts' as any,
      reportsDir: '/mock/reports' as any,
      checkpointsDir: '/mock/checkpoints' as any,
      missionDir: '/mock/mission' as any,
      docsDir: '/mock/docs' as any,
      testsDir: '/mock/tests' as any
    },
    mission: {
      id: 'mission_1',
      projectPath: '/mock/root' as any,
      durationHours: 12,
      agents: ['agent-1-cli', 'agent-2-topology'],
      startedAt: '2024-01-01T00:00:00Z' as any,
      minimumElapsedAt: '2024-01-01T12:00:00Z' as any,
      checkpointMode: 'agent_proposed',
      status: 'handoff_completed'
    },
    topology: {
      projectId: 'proj_123' as any,
      mappedAt: '2024-01-01T00:01:00Z' as any,
      sourceFiles: ['src/a.ts' as any],
      testFiles: [],
      docFiles: [],
      configFiles: [],
      orphanFiles: [],
      dependencies: [],
      topologyHash: 'hash1' as any
    },
    checkpoints: [
      {
        id: 'cp_1',
        name: 'CP 1',
        purpose: 'Test CP',
        proofCommand: 'npm test',
        accountingDomainId: 'domain_1',
        successMetric: 'all passed',
        refusalCondition: 'any failed',
        expectedArtifacts: [],
        expectedReports: [],
        workflow: { kind: 'silent', id: 'n1' as any }
      }
    ],
    accounting: {
      wizardCommand: {
        id: '1',
        unit: 'wizard_command',
        attempted: 1,
        terminal: { succeeded: 1, refused: 0, failed: 0 },
        invariant: 'terminal_equals_attempted',
        conserved: true
      },
      gallCheckpoint: {
        id: '2',
        unit: 'gall_checkpoint',
        attempted: 1,
        terminal: { proposed: 0, accepted: 0, refused: 0, executed: 1, failed: 0 },
        invariant: 'terminal_equals_attempted',
        conserved: true
      }
    },
    proofs: {
      initVerified: true,
      mapVerified: true,
      planVerified: true,
      forgeVerified: true,
      bindVerified: true,
      proveVerified: true,
      hardenVerified: true,
      handoffVerified: true,
      twelveHourGateVerified: true
    },
    metrics: {
      commandsAttempted: 1,
      checkpointsProposed: 1,
      checkpointsAccepted: 1,
      proofCommandsSucceeded: 1,
      proofCommandsFailed: 0,
      artifactsCreated: 1,
      artifactsUpdated: 0,
      reportHash: 'rep_hash_1' as any
    }
  };

  it('1. Wizard report projects to valid OCEL log', () => {
    const log = projectReportToOcel(mockReport);
    expect(log).toBeDefined();
    expect(log.events.length).toBeGreaterThan(0);
    expect(log.objects.length).toBeGreaterThan(0);
  });

  it('2. Project object exists', () => {
    const log = projectReportToOcel(mockReport);
    const projObj = log.objects.find(o => o.type === 'project');
    expect(projObj).toBeDefined();
    expect(projObj?.id).toBe('proj_123');
  });

  it('3. Agent objects exist', () => {
    const log = projectReportToOcel(mockReport);
    const agentObjs = log.objects.filter(o => o.type === 'agent');
    expect(agentObjs.length).toBe(2);
    expect(agentObjs.map(a => a.id)).toContain('agent-1-cli');
  });

  it('4. Checkpoint objects exist', () => {
    const log = projectReportToOcel(mockReport);
    const cpObj = log.objects.find(o => o.type === 'gall_checkpoint');
    expect(cpObj).toBeDefined();
    expect(cpObj?.id).toBe('checkpoint_cp_1');
  });

  it('5. Proof command events connect to proof command objects', () => {
    const event = proofCommandToOcelEvent({
      id: 'cmd_1',
      checkpointId: 'cp_1',
      exitCode: 0,
      durationMs: 100
    });
    
    expect(event.relationships.find(r => r.objectId === 'proof_cmd_cmd_1' && r.qualifier === 'proved_by')).toBeDefined();
  });

  it('6. Terminal events connect to receipt objects', () => {
    const event = wizardCommandToOcelEvent({
      id: 'cmd_2',
      verb: 'forge',
      status: 'succeeded',
      receiptHash: 'rec_hash_1',
      startedAt: '2024-01-01T00:00:00Z'
    });
    
    expect(event.relationships.find(r => r.objectId === 'receipt_rec_hash_1' && r.qualifier === 'emitted')).toBeDefined();
  });

  it('7. Mailbox confirmed event connects message + receipt + queue', () => {
    const mockMsg: PersistentMailboxMessage = {
      id: 'msg_1' as any,
      queue: 'hook',
      state: 'confirmed',
      payloadHash: 'phash' as any,
      payloadJson: {},
      uniqueConsequenceKey: 'uck' as any,
      attempt: 1,
      maxAttempts: 3,
      priority: 5,
      scheduledAt: '2024-01-01T00:00:00Z' as any,
      availableAt: '2024-01-01T00:00:00Z' as any,
      createdAt: '2024-01-01T00:00:00Z' as any,
      updatedAt: '2024-01-01T00:00:00Z' as any,
      receiptHash: 'rec_hash_1' as any
    };
    
    const log = mailboxReportToOcel([mockMsg]);
    const confEvent = log.events.find(e => e.type === 'mailbox_confirmed');
    expect(confEvent).toBeDefined();
    expect(confEvent?.relationships.find(r => r.objectId === 'msg_1' && r.qualifier === 'changed')).toBeDefined();
    expect(confEvent?.relationships.find(r => r.objectId === 'queue_hook' && r.qualifier === 'depends_on')).toBeDefined();
    expect(confEvent?.relationships.find(r => r.objectId === 'receipt_rec_hash_1' && r.qualifier === 'emitted')).toBeDefined();
  });

  it('8. Refused event connects failure + receipt', () => {
    const mockMsg: PersistentMailboxMessage = {
      id: 'msg_2' as any,
      queue: 'hook',
      state: 'refused',
      payloadHash: 'phash' as any,
      payloadJson: {},
      uniqueConsequenceKey: 'uck' as any,
      attempt: 1,
      maxAttempts: 3,
      priority: 5,
      scheduledAt: '2024-01-01T00:00:00Z' as any,
      availableAt: '2024-01-01T00:00:00Z' as any,
      createdAt: '2024-01-01T00:00:00Z' as any,
      updatedAt: '2024-01-01T00:00:00Z' as any,
      receiptHash: 'rec_hash_2' as any,
      errorHash: 'err_hash_1' as any
    };
    
    const log = mailboxReportToOcel([mockMsg]);
    const refEvent = log.events.find(e => e.type === 'mailbox_refused');
    expect(refEvent).toBeDefined();
    expect(refEvent?.relationships.find(r => r.objectId === 'failure_err_hash_1' && r.qualifier === 'blocked_by')).toBeDefined();
    expect(refEvent?.relationships.find(r => r.objectId === 'receipt_rec_hash_2' && r.qualifier === 'emitted')).toBeDefined();
  });

  it('9. Handoff completed event connects final report', () => {
    const log = projectReportToOcel(mockReport);
    const handoffEvent = log.events.find(e => e.type === 'handoff_completed');
    expect(handoffEvent).toBeDefined();
    expect(handoffEvent?.relationships.find(r => r.objectId === 'report_rep_hash_1' && r.qualifier === 'reported_in')).toBeDefined();
  });

  it('10. Projection hash is stable across repeated runs', () => {
    const log1 = projectReportToOcel(mockReport);
    const log2 = projectReportToOcel(mockReport);
    
    const hash1 = crypto.createHash('sha256').update(JSON.stringify(log1)).digest('hex');
    const hash2 = crypto.createHash('sha256').update(JSON.stringify(log2)).digest('hex');
    
    expect(hash1).toBe(hash2);
  });
});
