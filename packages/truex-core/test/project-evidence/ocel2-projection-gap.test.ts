import { describe, it, expect } from 'vitest';
import crypto from 'node:crypto';
import {
  projectReportToOcel,
  mailboxReportToOcel,
  wizardCommandToOcelEvent,
  proofCommandToOcelEvent
} from '../../src/ocel2-project-projection.gall.js';
import type {
  WizardProjectReport,
  PersistentMailboxMessage,
  OcelId,
  ISODateTime
} from '../../src/ocel2-project-types.js';

describe('OCEL2 Projection Gap & Fidelity Tests', () => {

  const baseMockReport: WizardProjectReport = {
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

  it('should verify project report projection with different statuses', () => {
    // 1. passed status -> handoff_completed
    const passedLog = projectReportToOcel(baseMockReport);
    const completedEvent = passedLog.events.find(e => e.type === 'handoff_completed');
    expect(completedEvent).toBeDefined();
    expect(passedLog.events.find(e => e.type === 'handoff_refused')).toBeUndefined();
    
    // Check checkpoint accepted event exists for passed status
    const cpAcceptedEvent = passedLog.events.find(e => e.type === 'checkpoint_accepted');
    expect(cpAcceptedEvent).toBeDefined();
    expect(cpAcceptedEvent?.relationships.some(r => r.objectId === 'checkpoint_cp_1' && r.qualifier === 'accepted_by')).toBe(true);

    // 2. failed status -> handoff_refused
    const failedReport: WizardProjectReport = { ...baseMockReport, status: 'failed' };
    const failedLog = projectReportToOcel(failedReport);
    expect(failedLog.events.find(e => e.type === 'handoff_completed')).toBeUndefined();
    expect(failedLog.events.find(e => e.type === 'handoff_refused')).toBeDefined();

    // 3. refused status -> handoff_refused
    const refusedReport: WizardProjectReport = { ...baseMockReport, status: 'refused' };
    const refusedLog = projectReportToOcel(refusedReport);
    expect(refusedLog.events.find(e => e.type === 'handoff_completed')).toBeUndefined();
    expect(refusedLog.events.find(e => e.type === 'handoff_refused')).toBeDefined();
  });

  it('should verify every projected event connects to at least one object (round-trip validation)', () => {
    // Test on projectReportToOcel
    const projectLog = projectReportToOcel(baseMockReport);
    const objectIds = new Set(projectLog.objects.map(o => o.id));
    
    expect(projectLog.events.length).toBeGreaterThan(0);
    for (const event of projectLog.events) {
      expect(event.relationships.length).toBeGreaterThanOrEqual(1);
      for (const rel of event.relationships) {
        expect(objectIds.has(rel.objectId)).toBe(true);
      }
    }

    // Test on mailboxReportToOcel
    const mockMessages: PersistentMailboxMessage[] = [
      {
        id: 'msg_1' as OcelId,
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
      },
      {
        id: 'msg_2' as OcelId,
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
        errorHash: 'err_hash_1' as any
        // receiptHash is missing to test fallback
      }
    ];

    const mailboxLog = mailboxReportToOcel(mockMessages);
    const mailboxObjectIds = new Set(mailboxLog.objects.map(o => o.id));

    expect(mailboxLog.events.length).toBeGreaterThan(0);
    for (const event of mailboxLog.events) {
      expect(event.relationships.length).toBeGreaterThanOrEqual(1);
      for (const rel of event.relationships) {
        expect(mailboxObjectIds.has(rel.objectId)).toBe(true);
      }
    }
  });

  it('should verify every terminal event connects to receipt evidence', () => {
    // Handoff events in projectReportToOcel
    const passedLog = projectReportToOcel(baseMockReport);
    const completedEvent = passedLog.events.find(e => e.type === 'handoff_completed')!;
    expect(completedEvent).toBeDefined();
    
    // Must have a relationship to a receipt object
    const completedReceiptRel = completedEvent.relationships.find(r => r.qualifier === 'emitted');
    expect(completedReceiptRel).toBeDefined();
    expect(completedReceiptRel?.objectId.startsWith('receipt_')).toBe(true);
    
    // Receipt object must exist in log
    const completedReceiptObj = passedLog.objects.find(o => o.id === completedReceiptRel?.objectId);
    expect(completedReceiptObj).toBeDefined();
    expect(completedReceiptObj?.type).toBe('receipt');

    // Mailbox messages
    const mockMessages: PersistentMailboxMessage[] = [
      {
        id: 'msg_1' as OcelId,
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
        updatedAt: '2024-01-01T00:00:00Z' as any
        // receiptHash is missing, tests fallback receipt linkage
      }
    ];

    const mailboxLog = mailboxReportToOcel(mockMessages);
    const confirmedEvent = mailboxLog.events.find(e => e.type === 'mailbox_confirmed')!;
    expect(confirmedEvent).toBeDefined();
    
    const mailboxReceiptRel = confirmedEvent.relationships.find(r => r.qualifier === 'emitted');
    expect(mailboxReceiptRel).toBeDefined();
    
    const mailboxReceiptObj = mailboxLog.objects.find(o => o.id === mailboxReceiptRel?.objectId);
    expect(mailboxReceiptObj).toBeDefined();
    expect(mailboxReceiptObj?.type).toBe('receipt');
  });

  it('should verify proof and checkpoint events connect properly', () => {
    // Checkpoint proposed event
    const log = projectReportToOcel(baseMockReport);
    const propEvent = log.events.find(e => e.type === 'checkpoint_proposed')!;
    expect(propEvent).toBeDefined();
    
    const propCpRel = propEvent.relationships.find(r => r.qualifier === 'proposed_by');
    expect(propCpRel).toBeDefined();
    expect(propCpRel?.objectId).toBe('checkpoint_cp_1');
    expect(log.objects.some(o => o.id === 'checkpoint_cp_1' && o.type === 'gall_checkpoint')).toBe(true);

    // Proof commands
    const mockProofCmd = {
      id: 'proof_cmd_123',
      checkpointId: 'cp_1',
      exitCode: 0,
      durationMs: 450,
      reportHash: 'rep_hash_1',
      receiptHash: 'proof_rec_hash'
    };

    const proofEvent = proofCommandToOcelEvent(mockProofCmd);
    expect(proofEvent.type).toBe('proof_succeeded');
    
    const proofCmdRel = proofEvent.relationships.find(r => r.qualifier === 'proved_by');
    expect(proofCmdRel).toBeDefined();
    expect(proofCmdRel?.objectId).toBe('proof_cmd_proof_cmd_123');

    const reportRel = proofEvent.relationships.find(r => r.qualifier === 'reported_in');
    expect(reportRel).toBeDefined();
    expect(reportRel?.objectId).toBe('report_rep_hash_1');

    const receiptRel = proofEvent.relationships.find(r => r.qualifier === 'emitted');
    expect(receiptRel).toBeDefined();
    expect(receiptRel?.objectId).toBe('receipt_proof_rec_hash');
  });

  it('should verify hash stability across repeated runs', () => {
    const log1 = projectReportToOcel(baseMockReport);
    const log2 = projectReportToOcel(baseMockReport);

    const hash1 = crypto.createHash('sha256').update(JSON.stringify(log1)).digest('hex');
    const hash2 = crypto.createHash('sha256').update(JSON.stringify(log2)).digest('hex');

    expect(hash1).toBe(hash2);
  });
});
