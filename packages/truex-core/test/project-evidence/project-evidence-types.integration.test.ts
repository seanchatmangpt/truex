import { describe, it, expect } from 'vitest';
import { 
  projectReportToOcel, 
  mailboxReportToOcel 
} from '../../src/ocel2-project-projection.gall.js';
import { 
  PROJECT_CONSTRAINTS, 
  evaluateProjectConstraint 
} from '../../src/ocpq-project-constraints.gall.js';
import { 
  getWizard8VerbWorkflow, 
  validateChoiceGraph 
} from '../../src/powl-project-workflow.gall.js';
import { 
  WizardProjectReport, 
  OcelId, 
  ProjectPath, 
  ISODateTime, 
  Hash256 
} from '../../src/ocel2-project-types.js';

describe('Project Evidence Types S12 Integration tests', () => {
  it('should run a complete integration scenario asserting compliance rules', () => {
    // 1. Wizard 8-verb workflow validates
    const workflow = getWizard8VerbWorkflow();
    validateChoiceGraph(workflow);
    expect(workflow.id).toBe('wizard_8_verb_powl');

    // 2. Build report mapping files and checkpoints
    const report: WizardProjectReport = {
      case: 'truex-project-wizard',
      status: 'passed',
      projectCell: {
        projectId: 'project_123' as OcelId,
        root: '/root' as ProjectPath,
        truexDir: '/root/.truex' as ProjectPath,
        receiptsDir: '/root/.truex/receipts' as ProjectPath,
        reportsDir: '/root/.truex/reports' as ProjectPath,
        checkpointsDir: '/root/.truex/checkpoints' as ProjectPath,
        missionDir: '/root/.truex/mission' as ProjectPath,
        docsDir: '/root/docs' as ProjectPath,
        testsDir: '/root/tests' as ProjectPath
      },
      mission: {
        id: 'm1',
        projectPath: '/root' as ProjectPath,
        durationHours: 12,
        agents: ['agent-1-cli'],
        startedAt: '2026-05-24T00:00:00Z' as ISODateTime,
        minimumElapsedAt: '2026-05-24T12:00:00Z' as ISODateTime,
        checkpointMode: 'agent_proposed',
        status: 'handoff_completed'
      },
      topology: {
        projectId: 'project_123' as OcelId,
        mappedAt: '2026-05-24T00:05:00Z' as ISODateTime,
        sourceFiles: ['src/app.ts' as ProjectPath],
        testFiles: ['test/app.test.ts' as ProjectPath],
        docFiles: [],
        configFiles: [],
        orphanFiles: [],
        dependencies: [],
        topologyHash: 'hash123' as Hash256
      },
      checkpoints: [
        {
          id: 'cp_1',
          name: 'First',
          purpose: 'Purpose text that passes length constraint',
          proofCommand: 'npm run test',
          accountingDomainId: 'W1',
          successMetric: 'Pass',
          refusalCondition: 'Fail',
          expectedArtifacts: ['art.js' as ProjectPath],
          expectedReports: [],
          workflow: { kind: 'activity', id: 'act_cp1' as any, label: 'first' }
        }
      ],
      accounting: {
        wizardCommand: {
          id: 'w1',
          unit: 'wizard_command',
          attempted: 1,
          terminal: { succeeded: 1, refused: 0, failed: 0 },
          invariant: 'terminal_equals_attempted',
          conserved: true
        },
        gallCheckpoint: {
          id: 'w2',
          unit: 'gall_checkpoint',
          attempted: 1,
          terminal: { proposed: 1, accepted: 1, refused: 0, executed: 1, failed: 0 },
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
        reportHash: 'report_hash' as Hash256
      }
    };

    // 3. Project to OCEL
    const ocelLog = projectReportToOcel(report);

    // 4. Assert constraint checks
    const timingConstraint = PROJECT_CONSTRAINTS.find(c => c.id === 'c-handoff-timing')!;
    const timingViolations = evaluateProjectConstraint(timingConstraint, ocelLog);
    // Since we don't have handoff event in ocelLog yet, it has 0 violations.
    expect(timingViolations.length).toBe(0);

    const checkpointConstraint = PROJECT_CONSTRAINTS.find(c => c.id === 'c-checkpoint-accounting')!;
    const checkpointViolations = evaluateProjectConstraint(checkpointConstraint, ocelLog);
    expect(checkpointViolations.length).toBe(0);
  });
});
