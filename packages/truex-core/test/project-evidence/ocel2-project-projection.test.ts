import { describe, it, expect } from 'vitest';
import { 
  projectReportToOcel, 
  mailboxReportToOcel 
} from '../../src/ocel2-project-projection.gall.js';
import { 
  WizardProjectReport, 
  PersistentMailboxMessage, 
  OcelId, 
  ProjectPath, 
  ISODateTime,
  Hash256
} from '../../src/ocel2-project-types.js';

describe('Truex Project Evidence Projection Domain (Agent 2)', () => {
  it('should project a wizard report into a valid OCEL v2 log', () => {
    const report: WizardProjectReport = {
      case: 'truex-project-wizard',
      status: 'passed',
      projectCell: {
        projectId: 'project_1' as OcelId,
        root: '/Users/sac/truex' as ProjectPath,
        truexDir: '/Users/sac/truex/.truex' as ProjectPath,
        receiptsDir: '/Users/sac/truex/.truex/receipts' as ProjectPath,
        reportsDir: '/Users/sac/truex/.truex/reports' as ProjectPath,
        checkpointsDir: '/Users/sac/truex/.truex/checkpoints' as ProjectPath,
        missionDir: '/Users/sac/truex/.truex/mission' as ProjectPath,
        docsDir: '/Users/sac/truex/docs' as ProjectPath,
        testsDir: '/Users/sac/truex/tests' as ProjectPath
      },
      mission: {
        id: 'mission_1',
        projectPath: '/Users/sac/truex' as ProjectPath,
        durationHours: 12,
        agents: ['agent-1-cli', 'agent-2-topology', 'agent-3-planner', 'agent-4-execution', 'agent-5-handoff'],
        startedAt: '2026-05-24T00:00:00Z' as ISODateTime,
        minimumElapsedAt: '2026-05-24T12:00:00Z' as ISODateTime,
        checkpointMode: 'agent_proposed',
        status: 'handoff_completed'
      },
      topology: {
        projectId: 'project_1' as OcelId,
        mappedAt: '2026-05-24T00:01:00Z' as ISODateTime,
        sourceFiles: ['src/index.ts' as ProjectPath],
        testFiles: ['test/index.test.ts' as ProjectPath],
        docFiles: [],
        configFiles: [],
        orphanFiles: [],
        dependencies: [],
        topologyHash: 'topo_hash' as Hash256
      },
      checkpoints: [],
      accounting: {
        wizardCommand: {
          id: 'acc1',
          unit: 'wizard_command',
          attempted: 8,
          terminal: { succeeded: 8, refused: 0, failed: 0 },
          invariant: 'terminal_equals_attempted',
          conserved: true
        },
        gallCheckpoint: {
          id: 'acc2',
          unit: 'gall_checkpoint',
          attempted: 5,
          terminal: { proposed: 5, accepted: 5, refused: 0, executed: 5, failed: 0 },
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
        commandsAttempted: 8,
        checkpointsProposed: 5,
        checkpointsAccepted: 5,
        proofCommandsSucceeded: 5,
        proofCommandsFailed: 0,
        artifactsCreated: 10,
        artifactsUpdated: 0,
        reportHash: 'report_hash' as Hash256
      }
    };

    const log = projectReportToOcel(report);
    expect(log.eventTypes.length).toBeGreaterThan(0);
    expect(log.events.length).toBe(2); // init + map
    expect(log.objects.length).toBeGreaterThan(0);

    const projectObj = log.objects.find(o => o.type === 'project');
    expect(projectObj).toBeDefined();
    expect(projectObj?.attributes[0].value).toBe('/Users/sac/truex');
  });

  it('should project mailbox messages into valid OCEL event relationships', () => {
    const messages: PersistentMailboxMessage[] = [
      {
        id: 'msg_1' as OcelId,
        queue: 'hook',
        state: 'confirmed',
        payloadHash: 'hash1' as Hash256,
        payloadJson: {},
        uniqueConsequenceKey: 'key1' as Hash256,
        attempt: 1,
        maxAttempts: 3,
        priority: 1,
        scheduledAt: '2026-05-24T00:00:00Z' as ISODateTime,
        availableAt: '2026-05-24T00:00:00Z' as ISODateTime,
        createdAt: '2026-05-24T00:00:00Z' as ISODateTime,
        updatedAt: '2026-05-24T00:00:05Z' as ISODateTime,
        completedAt: '2026-05-24T00:00:05Z' as ISODateTime
      }
    ];

    const log = mailboxReportToOcel(messages);
    expect(log.objects.length).toBe(1);
    expect(log.events.length).toBe(2); // enqueued + confirmed
    expect(log.events[1].type).toBe('mailbox_confirmed');
  });
});
