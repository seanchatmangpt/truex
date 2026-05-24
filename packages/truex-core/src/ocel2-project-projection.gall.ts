import type {
  OcelV2Log,
  OcelEventType,
  OcelObjectType,
  OcelEvent,
  OcelObject,
  WizardProjectReport,
  PersistentMailboxMessage,
  BoundaryGallCheckpoint,
  OcelId,
  OcelTypeName,
  Qualifier,
  ISODateTime,
  WizardCommandReceipt,
  OcelEventObjectRelationship,
  OcelObjectObjectRelationship
} from './ocel2-project-types.js';

export const PROJECT_OBJECT_TYPES: OcelObjectType[] = [
  { name: 'project' as OcelTypeName, attributes: [{ name: 'root', type: 'string' as any }] },
  { name: 'agent' as OcelTypeName, attributes: [{ name: 'role', type: 'string' as any }] },
  { name: 'gall_checkpoint' as OcelTypeName, attributes: [{ name: 'name', type: 'string' as any }, { name: 'purpose', type: 'string' as any }] },
  { name: 'wizard_command' as OcelTypeName, attributes: [{ name: 'verb', type: 'string' as any }, { name: 'status', type: 'string' as any }] },
  { name: 'source_file' as OcelTypeName, attributes: [{ name: 'path', type: 'string' as any }] },
  { name: 'test_file' as OcelTypeName, attributes: [{ name: 'path', type: 'string' as any }] },
  { name: 'doc_file' as OcelTypeName, attributes: [{ name: 'path', type: 'string' as any }] },
  { name: 'dependency' as OcelTypeName, attributes: [{ name: 'name', type: 'string' as any }] },
  { name: 'proof_command' as OcelTypeName, attributes: [{ name: 'command', type: 'string' as any }] },
  { name: 'receipt' as OcelTypeName, attributes: [{ name: 'receiptHash', type: 'string' as any }, { name: 'status', type: 'string' as any }] },
  { name: 'replay' as OcelTypeName, attributes: [{ name: 'replayHash', type: 'string' as any }] },
  { name: 'mailbox_message' as OcelTypeName, attributes: [{ name: 'queue', type: 'string' as any }, { name: 'state', type: 'string' as any }] },
  { name: 'queue' as OcelTypeName, attributes: [{ name: 'name', type: 'string' as any }] },
  { name: 'report' as OcelTypeName, attributes: [{ name: 'reportHash', type: 'string' as any }, { name: 'status', type: 'string' as any }] },
  { name: 'diagram' as OcelTypeName, attributes: [{ name: 'name', type: 'string' as any }] },
  { name: 'failure' as OcelTypeName, attributes: [{ name: 'reason', type: 'string' as any }] },
  { name: 'accounting_domain' as OcelTypeName, attributes: [{ name: 'id', type: 'string' as any }] }
];

export const PROJECT_EVENT_TYPES: OcelEventType[] = [
  { name: 'project_initialized' as OcelTypeName, attributes: [{ name: 'mission', type: 'string' as any }] },
  { name: 'project_mapped' as OcelTypeName, attributes: [] },
  { name: 'checkpoint_proposed' as OcelTypeName, attributes: [] },
  { name: 'checkpoint_accepted' as OcelTypeName, attributes: [] },
  { name: 'artifact_forged' as OcelTypeName, attributes: [{ name: 'path', type: 'string' as any }] },
  { name: 'artifact_bound' as OcelTypeName, attributes: [] },
  { name: 'proof_started' as OcelTypeName, attributes: [] },
  { name: 'proof_succeeded' as OcelTypeName, attributes: [{ name: 'durationMs', type: 'integer' as any }] },
  { name: 'proof_failed' as OcelTypeName, attributes: [{ name: 'durationMs', type: 'integer' as any }] },
  { name: 'hardening_started' as OcelTypeName, attributes: [] },
  { name: 'breakpoint_discovered' as OcelTypeName, attributes: [] },
  { name: 'mailbox_enqueued' as OcelTypeName, attributes: [] },
  { name: 'mailbox_claimed' as OcelTypeName, attributes: [] },
  { name: 'mailbox_confirmed' as OcelTypeName, attributes: [] },
  { name: 'mailbox_refused' as OcelTypeName, attributes: [] },
  { name: 'mailbox_retried' as OcelTypeName, attributes: [] },
  { name: 'mailbox_quarantined' as OcelTypeName, attributes: [] },
  { name: 'mailbox_rescued' as OcelTypeName, attributes: [] },
  { name: 'receipt_emitted' as OcelTypeName, attributes: [] },
  { name: 'replay_converged' as OcelTypeName, attributes: [] },
  { name: 'replay_diverged' as OcelTypeName, attributes: [] },
  { name: 'handoff_refused' as OcelTypeName, attributes: [] },
  { name: 'handoff_completed' as OcelTypeName, attributes: [] }
];

export function checkpointToOcelObject(checkpoint: BoundaryGallCheckpoint): OcelObject {
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

export function receiptToOcelObject(receipt: WizardCommandReceipt | any): OcelObject {
  return {
    id: `receipt_${receipt.receiptHash || receipt.id}` as OcelId,
    type: 'receipt' as OcelTypeName,
    attributes: [
      { name: 'receiptHash', value: receipt.receiptHash, time: (receipt.completedAt || new Date().toISOString()) as ISODateTime },
      { name: 'status', value: receipt.status || 'succeeded', time: (receipt.completedAt || new Date().toISOString()) as ISODateTime }
    ],
    relationships: receipt.previousReceiptHash ? [
      { objectId: `receipt_${receipt.previousReceiptHash}` as OcelId, qualifier: 'previous_receipt' as Qualifier }
    ] : []
  };
}

export function wizardCommandToOcelEvent(command: WizardCommandReceipt | any, projectId?: string): OcelEvent {
  const isTerminal = command.status === 'succeeded' || command.status === 'failed' || command.status === 'refused';
  const relationships: OcelEventObjectRelationship[] = [
    { objectId: `wizard_command_${command.id}` as OcelId, qualifier: 'changed' as Qualifier }
  ];
  if (isTerminal && command.receiptHash) {
     relationships.push({ objectId: `receipt_${command.receiptHash}` as OcelId, qualifier: 'emitted' as Qualifier });
  }
  if (projectId) {
     relationships.push({ objectId: projectId as OcelId, qualifier: 'changed' as Qualifier });
  }
  
  let type = 'project_mapped';
  if (command.verb === 'prove') {
    type = command.status === 'succeeded' ? 'proof_succeeded' : (command.status === 'failed' ? 'proof_failed' : 'proof_started');
  } else if (command.verb === 'handoff') {
     type = command.status === 'succeeded' ? 'handoff_completed' : 'handoff_refused';
  } else if (command.verb === 'forge') {
     type = 'artifact_forged';
  } else if (command.verb === 'bind') {
     type = 'artifact_bound';
  } else if (command.verb === 'init') {
     type = 'project_initialized';
  }
  
  return {
    id: `evt_cmd_${command.id || Date.now()}` as OcelId,
    type: type as OcelTypeName,
    time: (command.startedAt || new Date().toISOString()) as ISODateTime,
    attributes: [
      { name: 'verb', value: command.verb }
    ],
    relationships
  };
}

export function proofCommandToOcelEvent(command: any, projectId?: string): OcelEvent {
  const isSuccess = command.exitCode === 0 || command.status === 'succeeded';
  
  const relationships: OcelEventObjectRelationship[] = [
    { objectId: `proof_cmd_${command.id || command.checkpointId}` as OcelId, qualifier: 'proved_by' as Qualifier },
    { objectId: `report_${command.reportHash || 'default'}` as OcelId, qualifier: 'reported_in' as Qualifier }
  ];
  
  if (command.receiptHash) {
    relationships.push({ objectId: `receipt_${command.receiptHash}` as OcelId, qualifier: 'emitted' as Qualifier });
  }

  if (projectId) {
    relationships.push({ objectId: projectId as OcelId, qualifier: 'changed' as Qualifier });
  }
  
  return {
    id: `evt_proof_${command.id || command.checkpointId || Date.now()}` as OcelId,
    type: (isSuccess ? 'proof_succeeded' : 'proof_failed') as OcelTypeName,
    time: new Date().toISOString() as ISODateTime,
    attributes: [
      { name: 'durationMs', value: command.durationMs || 0 }
    ],
    relationships
  };
}

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

  // Report Object
  objects.push({
    id: `report_${report.metrics.reportHash}` as OcelId,
    type: 'report' as OcelTypeName,
    attributes: [
      { name: 'reportHash', value: report.metrics.reportHash, time: report.mission.startedAt },
      { name: 'status', value: report.status, time: report.mission.startedAt }
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
    
    const propRels: OcelEventObjectRelationship[] = [
      { objectId: `checkpoint_${cp.id}` as OcelId, qualifier: 'proposed_by' as Qualifier }
    ];
    if (report.mission.agents.length > 0) {
      propRels.push({ objectId: report.mission.agents[0] as OcelId, qualifier: 'proposed_by' as Qualifier });
    }

    events.push({
      id: `evt_cp_prop_${cp.id}` as OcelId,
      type: 'checkpoint_proposed' as OcelTypeName,
      time: report.mission.startedAt,
      attributes: [],
      relationships: propRels
    });

    if (report.status === 'passed') {
      const accRels: OcelEventObjectRelationship[] = [
        { objectId: `checkpoint_${cp.id}` as OcelId, qualifier: 'accepted_by' as Qualifier }
      ];
      if (cp.proofCommand) {
        const proofCmdId = `proof_cmd_${cp.id}` as OcelId;
        accRels.push({ objectId: proofCmdId, qualifier: 'proved_by' as Qualifier });
        objects.push({
          id: proofCmdId,
          type: 'proof_command' as OcelTypeName,
          attributes: [{ name: 'command', value: cp.proofCommand, time: report.mission.startedAt }],
          relationships: []
        });
      }

      events.push({
        id: `evt_cp_acc_${cp.id}` as OcelId,
        type: 'checkpoint_accepted' as OcelTypeName,
        time: (report.mission.minimumElapsedAt || report.mission.startedAt) as ISODateTime,
        attributes: [],
        relationships: accRels
      });
    }
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

  events.push({
    id: 'evt_init' as OcelId,
    type: 'project_initialized' as OcelTypeName,
    time: report.mission.startedAt,
    attributes: [
      { name: 'mission', value: report.mission.id }
    ],
    relationships: [
      { objectId: report.projectCell.projectId, qualifier: 'created_by' as Qualifier }
    ]
  });

  const handoffReceiptHash = (report.metrics.reportHash || 'handoff_default_hash') as string;
  const handoffReceiptId = `receipt_${handoffReceiptHash}` as OcelId;
  const handoffStatus = report.status === 'passed' ? 'succeeded' : 'failed';

  objects.push({
    id: handoffReceiptId,
    type: 'receipt' as OcelTypeName,
    attributes: [
      { name: 'receiptHash', value: handoffReceiptHash, time: report.mission.startedAt },
      { name: 'status', value: handoffStatus, time: report.mission.startedAt }
    ],
    relationships: []
  });

  if (report.status === 'passed') {
     events.push({
       id: 'evt_handoff' as OcelId,
       type: 'handoff_completed' as OcelTypeName,
       time: (report.mission.minimumElapsedAt || new Date().toISOString()) as ISODateTime,
       attributes: [],
       relationships: [
         { objectId: `report_${report.metrics.reportHash}` as OcelId, qualifier: 'reported_in' as Qualifier },
         { objectId: report.projectCell.projectId, qualifier: 'changed' as Qualifier },
         { objectId: handoffReceiptId, qualifier: 'emitted' as Qualifier }
       ]
     });
  } else if (report.status === 'failed' || report.status === 'refused') {
     events.push({
       id: 'evt_handoff' as OcelId,
       type: 'handoff_refused' as OcelTypeName,
       time: (report.mission.minimumElapsedAt || new Date().toISOString()) as ISODateTime,
       attributes: [],
       relationships: [
         { objectId: `report_${report.metrics.reportHash}` as OcelId, qualifier: 'reported_in' as Qualifier },
         { objectId: report.projectCell.projectId, qualifier: 'changed' as Qualifier },
         { objectId: handoffReceiptId, qualifier: 'emitted' as Qualifier }
       ]
     });
  }

  return {
    eventTypes: PROJECT_EVENT_TYPES,
    objectTypes: PROJECT_OBJECT_TYPES,
    events,
    objects
  };
}

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

    // Queue Object
    objects.push({
      id: `queue_${msg.queue}` as OcelId,
      type: 'queue' as OcelTypeName,
      attributes: [
        { name: 'name', value: msg.queue, time: msg.createdAt }
      ],
      relationships: []
    });

    const rHash = msg.receiptHash || (`receipt_fallback_${msg.id}` as any);
    if (msg.state === 'confirmed' || msg.state === 'refused' || msg.state === 'quarantined') {
       objects.push(receiptToOcelObject({
         id: rHash,
         receiptHash: rHash,
         status: msg.state === 'confirmed' ? 'succeeded' : 'failed',
         completedAt: msg.completedAt || msg.updatedAt
       }));
    }

    const enqRels: OcelEventObjectRelationship[] = [
      { objectId: msg.id, qualifier: 'emitted' as Qualifier }
    ];
    if (msg.parentReceiptHash) {
      enqRels.push({ objectId: `receipt_${msg.parentReceiptHash}` as OcelId, qualifier: 'caused_by' as Qualifier });
    }

    events.push({
      id: `enq_${msg.id}` as OcelId,
      type: 'mailbox_enqueued' as OcelTypeName,
      time: msg.createdAt,
      attributes: [],
      relationships: enqRels
    });

    if (msg.state === 'confirmed') {
      const rels: OcelEventObjectRelationship[] = [
        { objectId: msg.id, qualifier: 'changed' as Qualifier },
        { objectId: `queue_${msg.queue}` as OcelId, qualifier: 'depends_on' as Qualifier },
        { objectId: `receipt_${rHash}` as OcelId, qualifier: 'emitted' as Qualifier }
      ];
      if (msg.parentReceiptHash) {
        rels.push({ objectId: `receipt_${msg.parentReceiptHash}` as OcelId, qualifier: 'caused_by' as Qualifier });
      }

      events.push({
        id: `conf_${msg.id}` as OcelId,
        type: 'mailbox_confirmed' as OcelTypeName,
        time: msg.completedAt || msg.updatedAt,
        attributes: [],
        relationships: rels
      });
    } else if (msg.state === 'refused' || msg.state === 'quarantined') {
      const rels: OcelEventObjectRelationship[] = [
        { objectId: msg.id, qualifier: 'refused_by' as Qualifier }
      ];
      
      const failId = msg.errorHash ? msg.errorHash : msg.id;
      objects.push({
        id: `failure_${failId}` as OcelId,
        type: 'failure' as OcelTypeName,
        attributes: [{ name: 'reason', value: 'Mailbox failure', time: msg.updatedAt }],
        relationships: []
      });
      rels.push({ objectId: `failure_${failId}` as OcelId, qualifier: 'blocked_by' as Qualifier });
      rels.push({ objectId: `receipt_${rHash}` as OcelId, qualifier: 'emitted' as Qualifier });
      if (msg.parentReceiptHash) {
        rels.push({ objectId: `receipt_${msg.parentReceiptHash}` as OcelId, qualifier: 'caused_by' as Qualifier });
      }

      events.push({
        id: `ref_${msg.id}` as OcelId,
        type: 'mailbox_refused' as OcelTypeName,
        time: msg.completedAt || msg.updatedAt,
        attributes: [],
        relationships: rels
      });
    }
  }

  const uniqueObjectsMap = new Map<string, OcelObject>();
  for (const obj of objects) {
    if (!uniqueObjectsMap.has(obj.id)) {
      uniqueObjectsMap.set(obj.id, obj);
    }
  }

  return {
    eventTypes: PROJECT_EVENT_TYPES,
    objectTypes: PROJECT_OBJECT_TYPES,
    events,
    objects: Array.from(uniqueObjectsMap.values())
  };
}

export function validateOcelIntegrity(log: OcelV2Log): void {
  const objectIds = new Set(log.objects.map(o => o.id));
  for (const event of log.events) {
    if (event.relationships.length === 0) {
      throw new Error(`Integrity Error: Event ${event.id} of type ${event.type} has no relationships to objects`);
    }

    for (const rel of event.relationships) {
      if (!objectIds.has(rel.objectId)) {
        throw new Error(`Integrity Error: Event ${event.id} references missing object ${rel.objectId}`);
      }
    }
    
    // Check terminal events for receipts
    const isTerminal = ['handoff_completed', 'handoff_refused', 'proof_succeeded', 'proof_failed', 'mailbox_confirmed', 'mailbox_refused', 'mailbox_quarantined', 'replay_converged', 'replay_diverged'].includes(event.type as string);
    if (isTerminal) {
      const hasReceipt = event.relationships.some(r => r.objectId.startsWith('receipt_'));
      if (!hasReceipt) {
        throw new Error(`Integrity Error: Terminal event ${event.id} of type ${event.type} is missing a receipt relationship`);
      }
    }
  }
}

export function replayResultToOcelEvent(replayResult: any): { event: OcelEvent, objects: OcelObject[] } {
  const isConverged = replayResult.status === 'converged';
  
  const replayObj: OcelObject = {
    id: `replay_${replayResult.id}` as OcelId,
    type: 'replay' as OcelTypeName,
    attributes: [
      { name: 'replayHash', value: replayResult.replayHash, time: new Date().toISOString() as ISODateTime }
    ],
    relationships: []
  };

  const receiptObj = receiptToOcelObject({
    receiptHash: replayResult.receiptHash,
    status: isConverged ? 'succeeded' : 'failed',
    completedAt: new Date().toISOString()
  });

  const event: OcelEvent = {
    id: `evt_replay_${replayResult.id}` as OcelId,
    type: (isConverged ? 'replay_converged' : 'replay_diverged') as OcelTypeName,
    time: new Date().toISOString() as ISODateTime,
    attributes: [],
    relationships: [
      { objectId: replayObj.id, qualifier: 'executed_by' as Qualifier },
      { objectId: receiptObj.id, qualifier: 'emitted' as Qualifier }
    ]
  };

  return { event, objects: [replayObj, receiptObj] };
}
