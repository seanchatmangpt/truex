import { describe, it, expect } from 'vitest';
import crypto from 'node:crypto';
import {
  projectReportToOcel,
  mailboxReportToOcel,
  wizardCommandToOcelEvent,
  proofCommandToOcelEvent,
  validateOcelIntegrity,
  replayResultToOcelEvent
} from '../../src/ocel2-project-projection.gall.js';
import type {
  WizardProjectReport,
  PersistentMailboxMessage,
  OcelId,
  ISODateTime,
  OcelV2Log,
  OcelTypeName
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

  it('project report projection has project object', () => {
    const log = projectReportToOcel(baseMockReport);
    const projObj = log.objects.find(o => o.type === 'project');
    expect(projObj).toBeDefined();
    expect(projObj?.id).toBe('proj_123');
  });

  it('all events have at least one relationship', () => {
    const log = projectReportToOcel(baseMockReport);
    for (const event of log.events) {
      expect(event.relationships.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('terminal events have receipt relationship', () => {
    const log = projectReportToOcel(baseMockReport);
    validateOcelIntegrity(log); // Will throw if terminal event lacks receipt
    const handoffCompleted = log.events.find(e => e.type === 'handoff_completed')!;
    expect(handoffCompleted.relationships.some(r => r.objectId.startsWith('receipt_'))).toBe(true);
  });

  it('proof failed event links proof command, report, and project', () => {
    const mockProofCmd = {
      id: 'proof_cmd_bad',
      checkpointId: 'cp_1',
      exitCode: 1,
      durationMs: 450,
      reportHash: 'rep_hash_1',
      receiptHash: 'proof_rec_hash_failed',
      status: 'failed'
    };

    const proofEvent = proofCommandToOcelEvent(mockProofCmd, 'proj_123');
    expect(proofEvent.type).toBe('proof_failed');
    
    const proofCmdRel = proofEvent.relationships.find(r => r.qualifier === 'proved_by');
    expect(proofCmdRel?.objectId).toBe('proof_cmd_proof_cmd_bad');

    const reportRel = proofEvent.relationships.find(r => r.qualifier === 'reported_in');
    expect(reportRel?.objectId).toBe('report_rep_hash_1');

    const projRel = proofEvent.relationships.find(r => r.objectId === 'proj_123');
    console.log("DEBUG PROOF EVENT RELS:", JSON.stringify(proofEvent.relationships, null, 2));
    expect(projRel).toBeDefined();
  });

  it('checkpoint event connects proposing agent and proof command', () => {
    const log = projectReportToOcel(baseMockReport);
    
    const propEvent = log.events.find(e => e.type === 'checkpoint_proposed')!;
    expect(propEvent).toBeDefined();
    expect(propEvent.relationships.some(r => r.objectId === 'checkpoint_cp_1')).toBe(true);
    expect(propEvent.relationships.some(r => r.objectId === 'agent-1-cli')).toBe(true);

    const accEvent = log.events.find(e => e.type === 'checkpoint_accepted')!;
    expect(accEvent).toBeDefined();
    expect(accEvent.relationships.some(r => r.objectId === 'checkpoint_cp_1')).toBe(true);
    expect(accEvent.relationships.some(r => r.objectId === 'proof_cmd_cp_1')).toBe(true);
  });

  it('wizard command projection connects project and receipt', () => {
    const mockCmd = {
      id: 'cmd_1',
      verb: 'prove',
      status: 'succeeded',
      startedAt: '2024-01-01T00:00:00Z',
      receiptHash: 'rec_hash_cmd'
    };

    const evt = wizardCommandToOcelEvent(mockCmd, 'proj_123');
    expect(evt.type).toBe('proof_succeeded');
    expect(evt.relationships.some(r => r.objectId === 'wizard_command_cmd_1')).toBe(true);
    expect(evt.relationships.some(r => r.objectId === 'receipt_rec_hash_cmd')).toBe(true);
    expect(evt.relationships.some(r => r.objectId === 'proj_123')).toBe(true);
  });

  it('mailbox events connect parent receipt if present', () => {
    const mockMessages: PersistentMailboxMessage[] = [
      {
        id: 'msg_parent' as OcelId,
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
        receiptHash: 'rec_hash_child' as any,
        parentReceiptHash: 'rec_hash_parent' as any
      }
    ];

    const log = mailboxReportToOcel(mockMessages);
    
    const enqEvent = log.events.find(e => e.type === 'mailbox_enqueued')!;
    expect(enqEvent.relationships.some(r => r.objectId === 'receipt_rec_hash_parent')).toBe(true);

    const confEvent = log.events.find(e => e.type === 'mailbox_confirmed')!;
    expect(confEvent.relationships.some(r => r.objectId === 'receipt_rec_hash_parent')).toBe(true);
  });

  it('mailbox refused links failure and receipt', () => {
    const mockMessages: PersistentMailboxMessage[] = [
      {
        id: 'msg_fail' as OcelId,
        queue: 'hook',
        state: 'refused',
        payloadHash: 'phash' as any,
        payloadJson: {},
        uniqueConsequenceKey: 'uck' as any,
        attempt: 3,
        maxAttempts: 3,
        priority: 5,
        scheduledAt: '2024-01-01T00:00:00Z' as any,
        availableAt: '2024-01-01T00:00:00Z' as any,
        createdAt: '2024-01-01T00:00:00Z' as any,
        updatedAt: '2024-01-01T00:00:00Z' as any,
        errorHash: 'err_hash_fail' as any,
        receiptHash: 'rec_hash_fail' as any
      }
    ];

    const log = mailboxReportToOcel(mockMessages);
    validateOcelIntegrity(log);
    
    const refusedEvent = log.events.find(e => e.type === 'mailbox_refused')!;
    expect(refusedEvent).toBeDefined();

    const failureRel = refusedEvent.relationships.find(r => r.objectId === 'failure_err_hash_fail');
    expect(failureRel).toBeDefined();
    
    const receiptRel = refusedEvent.relationships.find(r => r.objectId === 'receipt_rec_hash_fail');
    expect(receiptRel).toBeDefined();
  });

  it('replay converged links replay object and receipt', () => {
    const replayRes = {
      id: 'rep_123',
      status: 'converged',
      replayHash: 'r_hash',
      receiptHash: 'rec_hash'
    };

    const { event, objects } = replayResultToOcelEvent(replayRes);
    expect(event.type).toBe('replay_converged');
    
    const log: OcelV2Log = {
      eventTypes: [],
      objectTypes: [],
      events: [event],
      objects
    };
    validateOcelIntegrity(log);

    expect(event.relationships.find(r => r.objectId === 'replay_rep_123')).toBeDefined();
    expect(event.relationships.find(r => r.objectId === 'receipt_rec_hash')).toBeDefined();
  });

  it('handoff refused links refusal receipt', () => {
    const failedReport: WizardProjectReport = { ...baseMockReport, status: 'failed' };
    const log = projectReportToOcel(failedReport);
    validateOcelIntegrity(log);

    const refusedEvent = log.events.find(e => e.type === 'handoff_refused')!;
    expect(refusedEvent).toBeDefined();
    expect(refusedEvent.relationships.some(r => r.objectId === 'receipt_rep_hash_1')).toBe(true);
  });

  it('projection hash is stable', () => {
    const log1 = projectReportToOcel(baseMockReport);
    const log2 = projectReportToOcel(baseMockReport);

    const hash1 = crypto.createHash('sha256').update(JSON.stringify(log1)).digest('hex');
    const hash2 = crypto.createHash('sha256').update(JSON.stringify(log2)).digest('hex');

    expect(hash1).toBe(hash2);
  });

  it('projection detects missing object referenced by event', () => {
    const log = projectReportToOcel(baseMockReport);
    // Mutate to create integrity error
    (log.events[0].relationships as any[]).push({ objectId: 'missing_obj' as OcelId, qualifier: 'changed' as any });

    expect(() => validateOcelIntegrity(log)).toThrowError(/Integrity Error: Event .* references missing object missing_obj/);
  });

  it('projection refuses terminal event without receipt', () => {
    const log = projectReportToOcel(baseMockReport);
    // remove receipt relationship from handoff_completed
    const event = log.events.find(e => e.type === 'handoff_completed')!;
    const newRels = event.relationships.filter(r => !r.objectId.startsWith('receipt_'));
    (event as any).relationships = newRels;

    expect(() => validateOcelIntegrity(log)).toThrowError(/Integrity Error: Terminal event .* is missing a receipt relationship/);
  });

  it('projection handles tampered mailbox fixture properly', () => {
     // A tampered mailbox means state is tampered (or quarantined maybe?).
     // This just creates another permutation to guarantee robust mapping.
     const mockMessages: PersistentMailboxMessage[] = [
      {
        id: 'msg_tampered' as OcelId,
        queue: 'wizard',
        state: 'quarantined',
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
        errorHash: 'tampered_hash' as any
      }
    ];
    
    const log = mailboxReportToOcel(mockMessages);
    validateOcelIntegrity(log);
    const evt = log.events.find(e => e.type === 'mailbox_refused');
    expect(evt).toBeDefined();
    expect(evt?.relationships.some(r => r.objectId === 'failure_tampered_hash')).toBe(true);
  });

  it('projection refuses event with zero relationships', () => {
    const log = projectReportToOcel(baseMockReport);
    // Add a fake event with zero relationships
    const badEvent = {
      id: 'bad_event_zero_rels' as OcelId,
      type: 'project_mapped' as OcelTypeName,
      time: '2024-01-01T00:00:00Z' as ISODateTime,
      attributes: [],
      relationships: []
    };
    const logWithBadEvent: OcelV2Log = {
      ...log,
      events: [...log.events, badEvent]
    };

    expect(() => validateOcelIntegrity(logWithBadEvent)).toThrowError(/Integrity Error: Event bad_event_zero_rels of type project_mapped has no relationships to objects/);
  });

  it('proves round-trip reconstruction of original domain primitives from projected OCEL log', () => {
    // 1. Round-trip Project Report
    const log = projectReportToOcel(baseMockReport);
    validateOcelIntegrity(log);

    // Reconstruct Project Cell root
    const projObj = log.objects.find(o => o.type === 'project')!;
    const rootAttr = projObj.attributes.find(a => a.name === 'root')!;
    expect(rootAttr.value).toBe(baseMockReport.projectCell.root);

    // Reconstruct Handoff Status and Receipt Hash
    const receiptObj = log.objects.find(o => o.type === 'receipt' && o.id.startsWith('receipt_rep_hash_1'))!;
    const hashAttr = receiptObj.attributes.find(a => a.name === 'receiptHash')!;
    const statusAttr = receiptObj.attributes.find(a => a.name === 'status')!;
    expect(hashAttr.value).toBe(baseMockReport.metrics.reportHash);
    expect(statusAttr.value).toBe('succeeded'); // since baseMockReport.status is 'passed'

    // Reconstruct checkpoints
    for (const cp of baseMockReport.checkpoints) {
      const cpObj = log.objects.find(o => o.type === 'gall_checkpoint' && o.id === `checkpoint_${cp.id}`)!;
      const nameAttr = cpObj.attributes.find(a => a.name === 'name')!;
      const purposeAttr = cpObj.attributes.find(a => a.name === 'purpose')!;
      expect(nameAttr.value).toBe(cp.name);
      expect(purposeAttr.value).toBe(cp.purpose);
    }

    // 2. Round-trip Mailbox Messages
    const mockMessages: PersistentMailboxMessage[] = [
      {
        id: 'msg_1' as OcelId,
        queue: 'hook',
        state: 'confirmed',
        payloadHash: 'phash1' as any,
        payloadJson: {},
        uniqueConsequenceKey: 'uck1' as any,
        attempt: 1,
        maxAttempts: 3,
        priority: 5,
        scheduledAt: '2024-01-01T00:00:00Z' as any,
        availableAt: '2024-01-01T00:00:00Z' as any,
        createdAt: '2024-01-01T00:00:00Z' as any,
        updatedAt: '2024-01-01T00:00:00Z' as any,
        receiptHash: 'rec_1' as any
      }
    ];

    const mLog = mailboxReportToOcel(mockMessages);
    validateOcelIntegrity(mLog);

    const mObj = mLog.objects.find(o => o.type === 'mailbox_message' && o.id === 'msg_1')!;
    const queueAttr = mObj.attributes.find(a => a.name === 'queue')!;
    const stateAttr = mObj.attributes.find(a => a.name === 'state')!;
    expect(queueAttr.value).toBe('hook');
    expect(stateAttr.value).toBe('confirmed');

    const mReceiptObj = mLog.objects.find(o => o.type === 'receipt' && o.id === 'receipt_rec_1')!;
    expect(mReceiptObj).toBeDefined();
  });
});
