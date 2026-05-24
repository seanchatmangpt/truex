// packages/truex-core/src/ocel2-project-types.ts

/* ============================================================================
 * TRUEX OCEL2 / OCED / WIZARD TYPE PACK
 * ============================================================================
 *
 * Purpose:
 * TypeScript boundary types for projecting Truex project work into:
 * - OCEL 2.0-style object-centric event data
 * - OCPQ-style nested query/constraint structures
 * - POWL 2.0-style project workflows
 * - Truex wizard project manufacturing records
 *
 * Rule:
 * These are boundary/projection types. They are not the final hot-path
 * internal representation.
 * ========================================================================== */

export type Brand<T, B extends string> = T & { readonly __brand: B };

export type ISODateTime = Brand<string, "ISODateTime">;
export type Hash256 = Brand<string, "Hash256">;
export type ReceiptHash = Brand<Hash256, "ReceiptHash">;
export type ReplayHash = Brand<Hash256, "ReplayHash">;
export type ProjectPath = Brand<string, "ProjectPath">;
export type OcelId = Brand<string, "OcelId">;
export type OcelTypeName = Brand<string, "OcelTypeName">;
export type Qualifier = Brand<string, "Qualifier">;

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue =
  | JsonPrimitive
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };

/* ============================================================================
 * OCEL 2.0 / OCED CORE
 * ========================================================================== */

export type OcelAttributeKind =
  | "string"
  | "time"
  | "integer"
  | "float"
  | "boolean";

export type OcelAttributeValue =
  | string
  | number
  | boolean
  | null;

export interface OcelAttributeDefinition {
  readonly name: string;
  readonly type: OcelAttributeKind;
}

export interface OcelEventType {
  readonly name: OcelTypeName;
  readonly attributes: readonly OcelAttributeDefinition[];
}

export interface OcelObjectType {
  readonly name: OcelTypeName;
  readonly attributes: readonly OcelAttributeDefinition[];
}

export interface OcelEventAttribute {
  readonly name: string;
  readonly value: OcelAttributeValue;
}

export interface OcelObjectAttribute {
  readonly name: string;
  readonly value: OcelAttributeValue;

  /**
   * OCEL 2.0 supports evolving object attribute values.
   * This timestamp captures when the object attribute value is observed.
   */
  readonly time: ISODateTime;
}

export interface OcelEventObjectRelationship {
  readonly objectId: OcelId;
  readonly qualifier: Qualifier;
}

export interface OcelObjectObjectRelationship {
  readonly objectId: OcelId;
  readonly qualifier: Qualifier;
}

export interface OcelEvent {
  readonly id: OcelId;
  readonly type: OcelTypeName;
  readonly time: ISODateTime;
  readonly attributes: readonly OcelEventAttribute[];
  readonly relationships: readonly OcelEventObjectRelationship[];
}

export interface OcelObject {
  readonly id: OcelId;
  readonly type: OcelTypeName;
  readonly attributes: readonly OcelObjectAttribute[];
  readonly relationships: readonly OcelObjectObjectRelationship[];
}

export interface OcelV2Log {
  readonly eventTypes: readonly OcelEventType[];
  readonly objectTypes: readonly OcelObjectType[];
  readonly events: readonly OcelEvent[];
  readonly objects: readonly OcelObject[];
  readonly eventObjectRelationships?: readonly { readonly eventId: OcelId; readonly objectId: OcelId; readonly qualifier: Qualifier; }[];
  readonly objectObjectRelationships?: readonly { readonly sourceObjectId: OcelId; readonly targetObjectId: OcelId; readonly qualifier: Qualifier; }[];
}

/* ============================================================================
 * OCEL 2.0 SQLITE-ORIENTED ROW SHAPES
 * ========================================================================== */

export interface OcelEventRow {
  readonly ocel_id: OcelId;
  readonly ocel_type: OcelTypeName;
  readonly ocel_time: ISODateTime;
}

export interface OcelObjectRow {
  readonly ocel_id: OcelId;
  readonly ocel_type: OcelTypeName;
}

export interface OcelEventObjectRow {
  readonly ocel_event_id: OcelId;
  readonly ocel_object_id: OcelId;
  readonly ocel_qualifier: Qualifier;
}

export interface OcelObjectObjectRow {
  readonly ocel_source_id: OcelId;
  readonly ocel_target_id: OcelId;
  readonly ocel_qualifier: Qualifier;
}

export interface OcelEventAttributeRow {
  readonly ocel_event_id: OcelId;
  readonly name: string;
  readonly type: OcelAttributeKind;
  readonly value: OcelAttributeValue;
}

export interface OcelObjectAttributeRow {
  readonly ocel_object_id: OcelId;
  readonly name: string;
  readonly type: OcelAttributeKind;
  readonly value: OcelAttributeValue;
  readonly ocel_time: ISODateTime;
}

/* ============================================================================
 * TRUEX PROJECT OBJECT TYPES
 * ========================================================================== */

export type TruexProjectObjectType =
  | "project"
  | "agent"
  | "gall_checkpoint"
  | "wizard_command"
  | "source_file"
  | "test_file"
  | "doc_file"
  | "dependency"
  | "proof_command"
  | "receipt"
  | "replay"
  | "mailbox_message"
  | "queue"
  | "report"
  | "diagram"
  | "failure"
  | "accounting_domain";

export type TruexProjectEventType =
  | "project_initialized"
  | "project_mapped"
  | "checkpoint_proposed"
  | "checkpoint_accepted"
  | "artifact_forged"
  | "artifact_bound"
  | "proof_started"
  | "proof_succeeded"
  | "proof_failed"
  | "hardening_started"
  | "breakpoint_discovered"
  | "mailbox_enqueued"
  | "mailbox_claimed"
  | "mailbox_confirmed"
  | "mailbox_refused"
  | "mailbox_retried"
  | "mailbox_quarantined"
  | "mailbox_rescued"
  | "receipt_emitted"
  | "replay_converged"
  | "replay_diverged"
  | "handoff_refused"
  | "handoff_completed";

export interface TruexOcelProjection {
  readonly kind: "truex-ocel2-projection";
  readonly projectId: OcelId;
  readonly emittedAt: ISODateTime;
  readonly sourceReportHash: Hash256;
  readonly ocel: OcelV2Log;
}

/* ============================================================================
 * OCPQ-STYLE NESTED QUERY / CONSTRAINT TYPES
 * ========================================================================== */

export type OcpqVariableKind = "event" | "object";

export interface OcpqVariable {
  readonly id: string;
  readonly kind: OcpqVariableKind;
  readonly type?: OcelTypeName;
}

export type OcpqComparisonOp =
  | "eq"
  | "neq"
  | "lt"
  | "lte"
  | "gt"
  | "gte"
  | "contains"
  | "startsWith"
  | "endsWith"
  | "exists";

export interface OcpqAttributePredicate {
  readonly kind: "attribute";
  readonly variable: string;
  readonly attribute: string;
  readonly op: OcpqComparisonOp;
  readonly value?: OcelAttributeValue;
}

export interface OcpqRelationshipPredicate {
  readonly kind: "relationship";
  readonly fromVariable: string;
  readonly toVariable: string;
  readonly qualifier?: Qualifier;
}

export interface OcpqTemporalPredicate {
  readonly kind: "temporal";
  readonly leftEventVariable: string;
  readonly op: "before" | "after" | "sameTime" | "within";
  readonly rightEventVariable: string;
  readonly durationMs?: number;
}

export type OcpqPredicate =
  | OcpqAttributePredicate
  | OcpqRelationshipPredicate
  | OcpqTemporalPredicate
  | OcpqLogicalPredicate;

export interface OcpqLogicalPredicate {
  readonly kind: "and" | "or" | "not" | "implies";
  readonly predicates: readonly OcpqPredicate[];
}

export interface OcpqNestedQuery {
  readonly id: string;
  readonly label: string;
  readonly variables: readonly OcpqVariable[];
  readonly predicates: readonly OcpqPredicate[];
  readonly children: readonly OcpqNestedQuery[];
  readonly quantifier: "exists" | "forall" | "count" | "none";
}

export interface OcpqConstraint {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly violationQuery: OcpqNestedQuery;
  readonly severity: "info" | "warning" | "error" | "critical";
}

/* ============================================================================
 * PROCESS INTELLIGENCE / COMPLIANCE-AWARE RULE TYPES
 * ========================================================================== */

export type ProcessFeatureKind =
  | "control_flow"
  | "temporal"
  | "payload"
  | "resource"
  | "topology"
  | "receipt"
  | "replay";

export interface ProcessFeature {
  readonly id: string;
  readonly kind: ProcessFeatureKind;
  readonly sourceObjectTypes: readonly TruexProjectObjectType[];
  readonly sourceEventTypes: readonly TruexProjectEventType[];
  readonly valueType: OcelAttributeKind;
}

export type ProcessRuleKind =
  | "control_flow"
  | "temporal"
  | "payload"
  | "class_independent"
  | "class_dependent_non_outcome"
  | "class_dependent_outcome";

export interface ProcessRule {
  readonly id: string;
  readonly kind: ProcessRuleKind;
  readonly label: string;
  readonly formula: string;
  readonly features: readonly string[];
  readonly consequence:
    | "allow"
    | "refuse"
    | "warn"
    | "retry"
    | "quarantine"
    | "rollback"
    | "require_handoff_block";
}

export interface ProcessKnowledgeBase {
  readonly id: string;
  readonly features: readonly ProcessFeature[];
  readonly rules: readonly ProcessRule[];
  readonly satisfactionOperator?: "pMean" | "pMeanError" | "min" | "product";
}

/* ============================================================================
 * POWL 2.0 / GALL WORKFLOW TYPES
 * ========================================================================== */

export type BoundaryPowlNodeId = Brand<string, "BoundaryPowlNodeId">;

export interface BoundaryPowlActivity {
  readonly kind: "activity";
  readonly id: BoundaryPowlNodeId;
  readonly label: string;
}

export interface BoundaryPowlSilent {
  readonly kind: "silent";
  readonly id: BoundaryPowlNodeId;
}

export interface BoundaryPowlPartialOrder {
  readonly kind: "partial_order";
  readonly id: BoundaryPowlNodeId;
  readonly children: readonly BoundaryPowlNode[];
  readonly order: readonly BoundaryPowlOrderEdge[];
}

export interface BoundaryPowlChoiceGraph {
  readonly kind: "choice_graph";
  readonly id: BoundaryPowlNodeId;
  readonly children: readonly BoundaryPowlNode[];
  readonly edges: readonly BoundaryPowlChoiceEdge[];
  readonly start: "▷";
  readonly end: "□";
}

export type BoundaryPowlNode =
  | BoundaryPowlActivity
  | BoundaryPowlSilent
  | BoundaryPowlPartialOrder
  | BoundaryPowlChoiceGraph;

export interface BoundaryPowlOrderEdge {
  readonly before: BoundaryPowlNodeId;
  readonly after: BoundaryPowlNodeId;
}

export interface BoundaryPowlChoiceEdge {
  readonly from: BoundaryPowlNodeId | "▷";
  readonly to: BoundaryPowlNodeId | "□";
}

export interface BoundaryGallCheckpoint {
  readonly id: string;
  readonly name: string;
  readonly purpose: string;
  readonly proofCommand: string;
  readonly accountingDomainId: string;
  readonly successMetric: string;
  readonly refusalCondition: string;
  readonly expectedArtifacts: readonly ProjectPath[];
  readonly expectedReports: readonly ProjectPath[];
  readonly workflow: BoundaryPowlNode;
}

/* ============================================================================
 * TRUEX WIZARD TYPES
 * ========================================================================== */

export type WizardVerb =
  | "init"
  | "map"
  | "plan"
  | "forge"
  | "bind"
  | "prove"
  | "harden"
  | "handoff";

export type WizardCommandStatus =
  | "succeeded"
  | "refused"
  | "failed";

export interface WizardCommandReceipt {
  readonly id: string;
  readonly verb: WizardVerb;
  readonly projectPath: ProjectPath;
  readonly status: WizardCommandStatus;
  readonly startedAt: ISODateTime;
  readonly completedAt: ISODateTime;
  readonly receiptHash: ReceiptHash;
  readonly previousReceiptHash?: ReceiptHash;
  readonly reportPath?: ProjectPath;
  readonly refusalReason?: string;
}

export type MissionAgentId =
  | "agent-1-cli"
  | "agent-2-topology"
  | "agent-3-planner"
  | "agent-4-execution"
  | "agent-5-handoff";

export interface WizardMission {
  readonly id: string;
  readonly projectPath: ProjectPath;
  readonly durationHours: 12;
  readonly agents: readonly MissionAgentId[];
  readonly startedAt: ISODateTime;
  readonly minimumElapsedAt: ISODateTime;
  readonly checkpointMode: "agent_proposed";
  readonly status:
    | "running"
    | "gate_closed"
    | "gate_open"
    | "handoff_refused"
    | "handoff_completed";
}

export interface BoundaryProjectCell {
  readonly projectId: OcelId;
  readonly root: ProjectPath;
  readonly truexDir: ProjectPath;
  readonly receiptsDir: ProjectPath;
  readonly reportsDir: ProjectPath;
  readonly checkpointsDir: ProjectPath;
  readonly missionDir: ProjectPath;
  readonly docsDir: ProjectPath;
  readonly testsDir: ProjectPath;
}

export interface ProjectTopology {
  readonly projectId: OcelId;
  readonly mappedAt: ISODateTime;
  readonly sourceFiles: readonly ProjectPath[];
  readonly testFiles: readonly ProjectPath[];
  readonly docFiles: readonly ProjectPath[];
  readonly configFiles: readonly ProjectPath[];
  readonly orphanFiles: readonly ProjectPath[];
  readonly dependencies: readonly string[];
  readonly topologyHash: Hash256;
}

/* ============================================================================
 * PERSISTENT OPERATIONAL MAILBOX TYPES
 * ========================================================================== */

export type PersistentMailboxQueue =
  | "hook"
  | "topology"
  | "rollback"
  | "replay"
  | "membrane"
  | "observatory"
  | "agy"
  | "quarantine"
  | "wizard";

export type PersistentMailboxState =
  | "scheduled"
  | "available"
  | "executing"
  | "retryable"
  | "confirmed"
  | "cancelled"
  | "discarded"
  | "suspended"
  | "refused"
  | "rolledBack"
  | "quarantined"
  | "tampered"
  | "rescueCandidate";

export type RetryPolicyKind =
  | "none"
  | "constant"
  | "linear"
  | "squared"
  | "exponential"
  | "jittered_deterministic";

export interface RetryPolicy {
  readonly kind: RetryPolicyKind;
  readonly baseDelayMs: number;
  readonly maxDelayMs: number;
  readonly maxAttempts: number;
  readonly jitterWindowMs?: number;
}

export interface PersistentMailboxQueueConfig {
  readonly queue: PersistentMailboxQueue;
  readonly concurrencyLimit: number;
  readonly maxDepth: number;
  readonly retryPolicy: RetryPolicy;
  readonly priorityRange: readonly [0, 9];
  readonly rescueAfterMs: number;
}

export interface PersistentMailboxMessage<TPayload extends JsonValue = JsonValue> {
  readonly id: OcelId;
  readonly queue: PersistentMailboxQueue;
  readonly state: PersistentMailboxState;

  readonly payloadHash: Hash256;

  /**
   * Boundary projection only. Do not treat this as core internal state.
   */
  readonly payloadJson: TPayload;

  readonly uniqueConsequenceKey: Hash256;
  readonly parentReceiptHash?: ReceiptHash;
  readonly previousMessageHash?: Hash256;

  readonly attempt: number;
  readonly maxAttempts: number;
  readonly priority: number;

  readonly scheduledAt: ISODateTime;
  readonly availableAt: ISODateTime;
  readonly claimedAt?: ISODateTime;
  readonly completedAt?: ISODateTime;

  readonly receiptHash?: ReceiptHash;
  readonly replayHash?: ReplayHash;
  readonly errorHash?: Hash256;

  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

export interface PersistentMailboxTransition {
  readonly id: OcelId;
  readonly messageId: OcelId;
  readonly fromState: PersistentMailboxState | "none";
  readonly toState: PersistentMailboxState;
  readonly reason: string;
  readonly receiptHash: ReceiptHash;
  readonly createdAt: ISODateTime;
}

export interface PersistentMailboxMetrics {
  readonly queue: PersistentMailboxQueue;
  readonly measuredAt: ISODateTime;
  readonly queueDepth: number;
  readonly oldestAvailableAgeMs: number;
  readonly executingCount: number;
  readonly retryableCount: number;
  readonly quarantinedCount: number;
  readonly discardedCount: number;
  readonly confirmedCount: number;
  readonly refusedCount: number;
  readonly replayConvergencePct: number;
}

/* ============================================================================
 * ACCOUNTING DOMAINS
 * ========================================================================== */

export interface AccountingDomain<
  TUnit extends string,
  TTerminal extends string,
  TOpen extends string = never,
> {
  readonly id: string;
  readonly unit: TUnit;
  readonly attempted: number;
  readonly terminal: Record<TTerminal, number>;
  readonly open?: Record<TOpen, number>;
  readonly invariant:
    | "terminal_equals_attempted"
    | "terminal_plus_open_equals_attempted"
    | "terminal_less_than_or_equal_attempted";
  readonly conserved: boolean;
}

export type MailboxMessageAccounting = AccountingDomain<
  "mailbox_message",
  | "confirmed"
  | "refused"
  | "rolledBack"
  | "quarantined"
  | "discarded"
  | "cancelled",
  | "scheduled"
  | "available"
  | "executing"
  | "retryable"
  | "suspended"
  | "rescueCandidate"
>;

export type WizardCommandAccounting = AccountingDomain<
  "wizard_command",
  "succeeded" | "refused" | "failed"
>;

export type GallCheckpointAccounting = AccountingDomain<
  "gall_checkpoint",
  "proposed" | "accepted" | "refused" | "executed" | "failed"
>;

/* ============================================================================
 * REPORT TYPES
 * ========================================================================== */

export interface WizardProjectReport {
  readonly case: "truex-project-wizard";
  readonly status: "passed" | "failed" | "refused";
  readonly projectCell: BoundaryProjectCell;
  readonly mission: WizardMission;
  readonly topology: ProjectTopology;
  readonly checkpoints: readonly BoundaryGallCheckpoint[];
  readonly ocelProjection?: TruexOcelProjection;
  readonly knowledgeBase?: ProcessKnowledgeBase;
  readonly accounting: {
    readonly wizardCommand: WizardCommandAccounting;
    readonly gallCheckpoint: GallCheckpointAccounting;
    readonly mailboxMessage?: MailboxMessageAccounting;
  };
  readonly proofs: {
    readonly initVerified: boolean;
    readonly mapVerified: boolean;
    readonly planVerified: boolean;
    readonly forgeVerified: boolean;
    readonly bindVerified: boolean;
    readonly proveVerified: boolean;
    readonly hardenVerified: boolean;
    readonly handoffVerified: boolean;
    readonly twelveHourGateVerified: boolean;
  };
  readonly metrics: {
    readonly commandsAttempted: number;
    readonly checkpointsProposed: number;
    readonly checkpointsAccepted: number;
    readonly proofCommandsSucceeded: number;
    readonly proofCommandsFailed: number;
    readonly artifactsCreated: number;
    readonly artifactsUpdated: number;
    readonly reportHash: Hash256;
  };
}

/* ============================================================================
 * TYPE GUARDS AND CONVERTORS FOR TESTS
 * ========================================================================== */

export const createOcelId = (id: string): OcelId => id as OcelId;
export const createOcelTypeName = (name: string): OcelTypeName => name as OcelTypeName;
export const createQualifier = (q: string): Qualifier => q as Qualifier;
export const createISODateTime = (dt: string): ISODateTime => dt as ISODateTime;

export function isOcelEventType(type: any): type is OcelEventType {
  return typeof type === 'object' && type !== null && typeof type.name === 'string';
}

export function isOcelObjectType(type: any): type is OcelObjectType {
  return typeof type === 'object' && type !== null && typeof type.name === 'string';
}

export function isOcelEventObjectRelationship(rel: any): rel is OcelEventObjectRelationship {
  return (
    typeof rel === 'object' &&
    rel !== null &&
    typeof rel.objectId === 'string' &&
    typeof rel.qualifier === 'string'
  );
}

export function isOcelObjectObjectRelationship(rel: any): rel is OcelObjectObjectRelationship {
  return (
    typeof rel === 'object' &&
    rel !== null &&
    typeof rel.objectId === 'string' &&
    typeof rel.qualifier === 'string'
  );
}

export function isOcelEventAttribute(attr: any): attr is OcelEventAttribute {
  return (
    typeof attr === 'object' &&
    attr !== null &&
    typeof attr.name === 'string' &&
    attr.value !== undefined
  );
}

export function isOcelObjectAttribute(attr: any): attr is OcelObjectAttribute {
  return (
    typeof attr === 'object' &&
    attr !== null &&
    typeof attr.name === 'string' &&
    attr.value !== undefined &&
    typeof attr.time === 'string'
  );
}

export function isOcelEvent(event: any): event is OcelEvent {
  return (
    typeof event === 'object' &&
    event !== null &&
    typeof event.id === 'string' &&
    typeof event.type === 'string' &&
    typeof event.time === 'string' &&
    Array.isArray(event.attributes) &&
    event.attributes.every(isOcelEventAttribute) &&
    Array.isArray(event.relationships) &&
    event.relationships.every(isOcelEventObjectRelationship)
  );
}

export function isOcelObject(object: any): object is OcelObject {
  return (
    typeof object === 'object' &&
    object !== null &&
    typeof object.id === 'string' &&
    typeof object.type === 'string' &&
    Array.isArray(object.attributes) &&
    object.attributes.every(isOcelObjectAttribute) &&
    Array.isArray(object.relationships) &&
    object.relationships.every(isOcelObjectObjectRelationship)
  );
}

export function isOcelV2Log(log: any): log is OcelV2Log {
  return (
    typeof log === 'object' &&
    log !== null &&
    Array.isArray(log.events) &&
    log.events.every(isOcelEvent) &&
    Array.isArray(log.objects) &&
    log.objects.every(isOcelObject) &&
    Array.isArray(log.eventTypes) &&
    log.eventTypes.every(isOcelEventType) &&
    Array.isArray(log.objectTypes) &&
    log.objectTypes.every(isOcelObjectType)
  );
}

