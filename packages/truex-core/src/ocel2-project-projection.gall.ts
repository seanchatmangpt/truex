/**
 * @module Ocel2ProjectProjection
 * @description
 * Gall Classification: Gall S12 (Project Evidence Projections)
 * Purpose: Projects Truex reports, checkpoints, and mailboxes to OCEL 2.0 formats.
 */

import {
  OcelV2Log,
  OcelEventType,
  OcelObjectType,
  OcelEvent,
  OcelObject,
  WizardProjectReport,
  PersistentMailboxMessage,
  GallCheckpoint,
  OcelId,
  OcelTypeName,
  Qualifier,
  ISODateTime,
  PowlNode,
  OcpqConstraint,
  OcelEventObjectRelationship,
  OcelObjectObjectRelationship
} from './ocel2-project-types.js';

// Define schemas for all project object types
export const PROJECT_OBJECT_TYPES: OcelObjectType[] = [
  { name: 'project' as OcelTypeName, attributes: [{ name: 'root', type: 'string' }] },
  { name: 'agent' as OcelTypeName, attributes: [{ name: 'role', type: 'string' }] },
  { name: 'gall_checkpoint' as OcelTypeName, attributes: [{ name: 'name', type: 'string' }, { name: 'purpose', type: 'string' }] },
  { name: 'wizard_command' as OcelTypeName, attributes: [{ name: 'verb', type: 'string' }] },
  { name: 'source_file' as OcelTypeName, attributes: [{ name: 'path', type: 'string' }] },
  { name: 'test_file' as OcelTypeName, attributes: [{ name: 'path', type: 'string' }] },
  { name: 'doc_file' as OcelTypeName, attributes: [{ name: 'path', type: 'string' }] },
  { name: 'proof_command' as OcelTypeName, attributes: [{ name: 'command', type: 'string' }] },
  { name: 'receipt' as OcelTypeName, attributes: [{ name: 'receiptHash', type: 'string' }, { name: 'status', type: 'string' }] },
  { name: 'mailbox_message' as OcelTypeName, attributes: [{ name: 'queue', type: 'string' }, { name: 'state', type: 'string' }] }
];

// Define schemas for all project event types
export const PROJECT_EVENT_TYPES: OcelEventType[] = [
  { name: 'project_initialized' as OcelTypeName, attributes: [{ name: 'mission', type: 'string' }] },
  { name: 'project_mapped' as OcelTypeName, attributes: [] },
  { name: 'checkpoint_proposed' as OcelTypeName, attributes: [] },
  { name: 'checkpoint_accepted' as OcelTypeName, attributes: [] },
  { name: 'artifact_forged' as OcelTypeName, attributes: [{ name: 'path', type: 'string' }] },
  { name: 'artifact_bound' as OcelTypeName, attributes: [] },
  { name: 'proof_started' as OcelTypeName, attributes: [] },
  { name: 'proof_succeeded' as OcelTypeName, attributes: [{ name: 'durationMs', type: 'integer' }] },
  { name: 'proof_failed' as OcelTypeName, attributes: [{ name: 'durationMs', type: 'integer' }] },
  { name: 'mailbox_enqueued' as OcelTypeName, attributes: [] },
  { name: 'mailbox_claimed' as OcelTypeName, attributes: [] },
  { name: 'mailbox_confirmed' as OcelTypeName, attributes: [] },
  { name: 'mailbox_refused' as OcelTypeName, attributes: [] },
  { name: 'handoff_completed' as OcelTypeName, attributes: [] }
];

export function checkpointToOcelObject(checkpoint: GallCheckpoint): OcelObject {
  return {
    id: `checkpoint_${checkpoint.id}` as OcelId,
    type: 'gall_checkpoint' as OcelTypeName,
    attributes: [
      { name: 'name', value: checkpoint.name, time: new Date(0).toISOString() as ISODateTime },
      { name: 'purpose', value: checkpoint.purpose, time: new Date(0).toISOString() as ISODateTime }
    ],
    relationships: []
  };
}

export function receiptToOcelObject(receipt: any): OcelObject {
  return {
    id: `receipt_${receipt.id || receipt.receiptHash}` as OcelId,
    type: 'receipt' as OcelTypeName,
    attributes: [
      { name: 'receiptHash', value: receipt.receiptHash, time: (receipt.completedAt || new Date().toISOString()) as ISODateTime },
      { name: 'status', value: receipt.status || 'succeeded', time: (receipt.completedAt || new Date().toISOString()) as ISODateTime }
    ],
    relationships: receipt.previousReceiptHash ? [
      { objectId: `receipt_${receipt.previousReceiptHash}` as OcelId, qualifier: 'parent_receipt' as Qualifier }
    ] : []
  };
}

export function wizardCommandToOcelEvent(command: any): OcelEvent {
  return {
    id: `cmd_${command.id || command.receiptHash || Date.now()}` as OcelEvent,
    type: `${command.verb}_started` as OcelTypeName, // e.g. init_started
    time: command.startedAt as ISODateTime,
    attributes: [
      { name: 'verb', value: command.verb }
    ],
    relationships: [
      { objectId: `project_${command.projectPath}` as OcelId, qualifier: 'project' as Qualifier }
    ]
  };
}

export function proofCommandToOcelEvent(command: any): OcelEvent {
  const isSuccess = command.exitCode === 0;
  return {
    id: `proof_cmd_${command.checkpointId || Date.now()}` as OcelEvent,
    type: (isSuccess ? 'proof_succeeded' : 'proof_failed') as OcelTypeName,
    time: new Date().toISOString() as ISODateTime,
    attributes: [
      { name: 'durationMs', value: command.durationMs || 0 }
    ],
    relationships: [
      { objectId: `checkpoint_${command.checkpointId}` as OcelId, qualifier: 'proved_by' as Qualifier }
    ]
  };
}

/**
 * Projects a full project report to an OCEL log.
 */
export function projectReportToOcel(report: WizardProjectReport): OcelV2Log {
  const objects: OcelObject[] = [];
  const events: OcelEvent[] = [];

  // Project Object
  objects.push({
    id: report.projectCell.projectId,
    type: 'project' as OcelTypeName,
    attributes: [
      { name: 'root', value: report.projectCell.root, time: report.mission.startedAt }
    ],
    relationships: []
  });

  // Agent Objects
  for (const agentId of report.mission.agents) {
    objects.push({
      id: agentId as OcelId,
      type: 'agent' as OcelTypeName,
      attributes: [
        { name: 'role', value: agentId, time: report.mission.startedAt }
      ],
      relationships: []
    });
  }

  // Checkpoint Objects
  for (const cp of report.checkpoints) {
    objects.push(checkpointToOcelObject(cp));
  }

  // Map topologies into objects
  for (const file of report.topology.sourceFiles) {
    objects.push({
      id: `file_${file}` as OcelId,
      type: 'source_file' as OcelTypeName,
      attributes: [{ name: 'path', value: file, time: report.topology.mappedAt }],
      relationships: []
    });
  }

  // Add event: project_initialized
  events.push({
    id: 'evt_init' as OcelId,
    type: 'project_initialized' as OcelTypeName,
    time: report.mission.startedAt,
    attributes: [
      { name: 'mission', value: report.mission.id }
    ],
    relationships: [
      { objectId: report.projectCell.projectId, qualifier: 'project' as Qualifier }
    ]
  });

  // Add event: project_mapped
  events.push({
    id: 'evt_map' as OcelId,
    type: 'project_mapped' as OcelTypeName,
    time: report.topology.mappedAt,
    attributes: [],
    relationships: [
      { objectId: report.projectCell.projectId, qualifier: 'project' as Qualifier }
    ]
  });

  return {
    eventTypes: PROJECT_EVENT_TYPES,
    objectTypes: PROJECT_OBJECT_TYPES,
    events,
    objects
  };
}

/**
 * Projects a mailbox message array into an OCEL log.
 */
export function mailboxReportToOcel(messages: PersistentMailboxMessage[]): OcelV2Log {
  const objects: OcelObject[] = [];
  const events: OcelEvent[] = [];

  for (const msg of messages) {
    // Message Object
    objects.push({
      id: msg.id,
      type: 'mailbox_message' as OcelTypeName,
      attributes: [
        { name: 'queue', value: msg.queue, time: msg.createdAt },
        { name: 'state', value: msg.state, time: msg.updatedAt }
      ],
      relationships: []
    });

    // Enqueued event
    events.push({
      id: `enq_${msg.id}` as OcelId,
      type: 'mailbox_enqueued' as OcelTypeName,
      time: msg.createdAt,
      attributes: [],
      relationships: [
        { objectId: msg.id, qualifier: 'message' as Qualifier }
      ]
    });

    // Confirmed/refused event
    if (msg.state === 'confirmed') {
      events.push({
        id: `conf_${msg.id}` as OcelId,
        type: 'mailbox_confirmed' as OcelTypeName,
        time: msg.completedAt || msg.updatedAt,
        attributes: [],
        relationships: [
          { objectId: msg.id, qualifier: 'message' as Qualifier }
        ]
      });
    } else if (msg.state === 'refused' || msg.state === 'quarantined') {
      events.push({
        id: `ref_${msg.id}` as OcelId,
        type: 'mailbox_refused' as OcelTypeName,
        time: msg.completedAt || msg.updatedAt,
        attributes: [],
        relationships: [
          { objectId: msg.id, qualifier: 'message' as Qualifier }
        ]
      });
    }
  }

  return {
    eventTypes: PROJECT_EVENT_TYPES,
    objectTypes: PROJECT_OBJECT_TYPES,
    events,
    objects
  };
}

export function checkpointWorkflowToPowl(checkpoints: GallCheckpoint[]): PowlNode {
  // Projects a list of checkpoints sequentially or via partial order
  return {
    kind: 'partial_order',
    id: 'powl_workflow_root' as any,
    children: checkpoints.map(cp => cp.workflow),
    order: []
  };
}

export function queryProjectConstraint(query: OcpqConstraint, log: OcelV2Log): any {
  // Stubs constraint queries on the OCEL log, which will be implemented by the constraint agent
  return {
    constraintId: query.id,
    violations: []
  };
}
