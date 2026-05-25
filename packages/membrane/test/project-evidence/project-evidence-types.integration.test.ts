import { describe, it, expect } from 'vitest';
import { hash } from '../../src/hash.js';
import { computeAccounting } from '../../src/runtime-law.js';
import {
  projectReportToOcel,
  mailboxReportToOcel,
  validateOcelIntegrity
} from '../../src/ocel2-project-projection.gall.js';
import {
  PROJECT_CONSTRAINTS,
  evaluateProjectConstraint,
  evaluateProjectConstraintsAll
} from '../../src/ocpq-project-constraints.gall.js';
import {
  getWizard8VerbWorkflow,
  validateChoiceGraph,
  validatePartialOrder
} from '../../src/powl-project-workflow.gall.js';
import type {
  OcelV2Log,
  OcelId,
  OcelTypeName,
  Qualifier,
  ISODateTime,
  WizardProjectReport,
  PersistentMailboxMessage,
  BoundaryProjectCell,
  WizardMission,
  ProjectTopology,
  BoundaryGallCheckpoint
} from '../../src/ocel2-project-types.js';

describe('Project Evidence Types S12 Integration', () => {
  it('validates OCEL boundary types and truex projection types compile', () => {
    const ocel: OcelV2Log = {
      eventTypes: [
        { name: 'project_initialized' as OcelTypeName, attributes: [{ name: 'mission', type: 'string' }] }
      ],
      objectTypes: [
        { name: 'project' as OcelTypeName, attributes: [{ name: 'root', type: 'string' }] }
      ],
      events: [
        {
          id: 'evt_1' as OcelId,
          type: 'project_initialized' as OcelTypeName,
          time: '2026-05-24T00:00:00Z' as ISODateTime,
          attributes: [{ name: 'mission', value: 'test' }],
          relationships: [{ objectId: 'obj_1' as OcelId, qualifier: 'created_by' as Qualifier }]
        }
      ],
      objects: [
        {
          id: 'obj_1' as OcelId,
          type: 'project' as OcelTypeName,
          attributes: [{ name: 'root', value: 'test_path', time: '2026-05-24T00:00:00Z' as ISODateTime }],
          relationships: []
        }
      ]
    };
    expect(ocel.events[0].id).toBe('evt_1');
    expect(() => validateOcelIntegrity(ocel)).not.toThrow();
  });

  it('validates project report can be projected to OCEL-style log', () => {
    const mockReport: WizardProjectReport = {
      case: 'truex-project-wizard',
      status: 'passed',
      projectCell: {
        projectId: 'project_1' as OcelId,
        root: 'root' as any,
        truexDir: 'truexDir' as any,
        receiptsDir: 'receiptsDir' as any,
        reportsDir: 'reportsDir' as any,
        checkpointsDir: 'checkpointsDir' as any,
        missionDir: 'missionDir' as any,
        docsDir: 'docsDir' as any,
        testsDir: 'testsDir' as any
      },
      mission: {
        id: 'mission_1',
        projectPath: 'root' as any,
        durationHours: 12,
        agents: ['agent-1-cli' as any],
        startedAt: '2026-05-24T00:00:00Z' as ISODateTime,
        minimumElapsedAt: '2026-05-24T12:00:00Z' as ISODateTime,
        checkpointMode: 'agent_proposed',
        status: 'handoff_completed'
      },
      topology: {
        projectId: 'project_1' as OcelId,
        mappedAt: '2026-05-24T01:00:00Z' as ISODateTime,
        sourceFiles: ['src/index.ts' as any],
        testFiles: [],
        docFiles: [],
        configFiles: [],
        orphanFiles: [],
        dependencies: [],
        topologyHash: 'topo_hash' as any
      },
      checkpoints: [
        {
          id: 'cp_1',
          name: 'Checkpoint 1',
          purpose: 'A valid purpose here',
          proofCommand: 'npm run test',
          accountingDomainId: 'acc_1',
          successMetric: 'all pass',
          refusalCondition: 'fails',
          expectedArtifacts: [],
          expectedReports: [],
          workflow: { kind: 'silent', id: 'silent_1' as any }
        }
      ],
      accounting: {
        wizardCommand: {
          id: 'acc_cmd', unit: 'wizard_command', attempted: 1, conserved: true,
          invariant: 'terminal_equals_attempted', terminal: { succeeded: 1, refused: 0, failed: 0 }
        },
        gallCheckpoint: {
          id: 'acc_cp', unit: 'gall_checkpoint', attempted: 1, conserved: true,
          invariant: 'terminal_equals_attempted', terminal: { proposed: 1, accepted: 0, refused: 0, executed: 0, failed: 0 }
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
        artifactsCreated: 0,
        artifactsUpdated: 0,
        reportHash: 'report_hash' as any
      }
    };

    const ocel = projectReportToOcel(mockReport);
    expect(ocel.events.length).toBeGreaterThan(0);
    expect(ocel.objects.length).toBeGreaterThan(0);
    expect(() => validateOcelIntegrity(ocel)).not.toThrow();
  });

  it('validates mailbox report can be projected to OCEL-style log', () => {
    const mockMessages: PersistentMailboxMessage[] = [
      {
        id: 'msg_1' as OcelId,
        queue: 'hook',
        state: 'confirmed',
        payloadHash: 'hash1' as any,
        payloadJson: { key: 'value' },
        uniqueConsequenceKey: 'conseq1' as any,
        attempt: 1,
        maxAttempts: 3,
        priority: 5,
        scheduledAt: '2026-05-24T00:00:00Z' as ISODateTime,
        availableAt: '2026-05-24T00:00:00Z' as ISODateTime,
        createdAt: '2026-05-24T00:00:00Z' as ISODateTime,
        updatedAt: '2026-05-24T00:01:00Z' as ISODateTime,
        completedAt: '2026-05-24T00:01:00Z' as ISODateTime,
        receiptHash: 'receipt_hash_1' as any
      }
    ];
    const ocel = mailboxReportToOcel(mockMessages);
    expect(ocel.events.length).toBeGreaterThan(0);
    expect(ocel.objects.length).toBeGreaterThan(0);
    expect(() => validateOcelIntegrity(ocel)).not.toThrow();
  });

  it('validates OCPQ-style constraints evaluate supported project constraints', () => {
    const prematureHandoffLog: OcelV2Log = {
      eventTypes: [],
      objectTypes: [],
      objects: [
        { id: 'proj_1' as OcelId, type: 'project' as OcelTypeName, attributes: [], relationships: [] },
        { id: 'receipt_handoff_hash' as OcelId, type: 'receipt' as OcelTypeName, attributes: [], relationships: [] }
      ],
      events: [
        {
          id: 'e_init' as OcelId, type: 'project_initialized' as OcelTypeName,
          time: '2026-05-24T00:00:00Z' as ISODateTime, attributes: [],
          relationships: [{ objectId: 'proj_1' as OcelId, qualifier: 'created' as Qualifier }]
        },
        {
          id: 'e_handoff' as OcelId, type: 'handoff_completed' as OcelTypeName,
          time: '2026-05-24T05:00:00Z' as ISODateTime, attributes: [], // 5 hours later (< 12 hours)
          relationships: [
            { objectId: 'proj_1' as OcelId, qualifier: 'changed' as Qualifier },
            { objectId: 'receipt_handoff_hash' as OcelId, qualifier: 'emitted' as Qualifier }
          ]
        }
      ]
    };
    const handoffConstraint = PROJECT_CONSTRAINTS.find(c => c.id === 'c-handoff-timing')!;
    const violations = evaluateProjectConstraint(handoffConstraint, prematureHandoffLog);
    expect(violations.length).toBe(1);
    expect(violations[0].message).toContain('completed prematurely');

    const report = evaluateProjectConstraintsAll(prematureHandoffLog);
    expect(report.violations.length).toBeGreaterThan(0);
    expect(report.accounting.attempted).toBe(PROJECT_CONSTRAINTS.length);
  });

  it('validates POWL/Gall workflow validates default Wizard workflow', () => {
    const workflow = getWizard8VerbWorkflow();
    expect(workflow.type).toBe('choice_graph');
    expect(validateChoiceGraph(workflow)).toBe(true);
  });

  it('verifies accounting domains conserve', () => {
    const acc = computeAccounting({
      attempted: 10,
      succeeded: 10,
      failed: 0,
      refused: 0,
      quarantined: 0,
      skipped: 0
    });
    expect(acc.successRatePct).toBe(100);
  });
});
