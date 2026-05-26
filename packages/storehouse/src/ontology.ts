/**
 * @module ontology
 * @description Domain ontology for the Storehouse Infrastructure.
 * Defines the patterns for Gleaning, Overflow, and Provision-Routing.
 */

/**
 * The root container for the Storehouse Pattern Graph.
 */
export interface StorehousePatternGraph {
  nodes: StorehouseNode[];
  edges: StorehouseEdge[];
  metadata: {
    version: string;
    lastUpdated: number;
    stewardshipStandard: 'TRUE-01';
  };
}

/**
 * Discrete entities within the Storehouse infrastructure.
 */
export type StorehouseNode = 
  | FieldCard 
  | EdgeCard 
  | OverflowRail 
  | FieldWallet 
  | GleaningSession 
  | ProvisionBatch;

/**
 * Relationships between Storehouse entities.
 */
export interface StorehouseEdge {
  source: string; // Node ID
  target: string; // Node ID
  type: 'ROUTES_TO' | 'FEEDS_INTO' | 'RECEIPTS_FROM' | 'GLEANED_BY' | 'PROVISIONED_FOR';
  timestamp: number;
}

// ─── Physical Primitives ─────────────────────────────────────────────────────

/**
 * Field Card: A localized identifier for a specific resource request or 
 * point of need in the field.
 */
export interface FieldCard {
  id: string;
  type: 'FIELD_CARD';
  location: GeoLocation;
  needType: 'FOOD' | 'WATER' | 'MEDICAL' | 'SHELTER' | 'OTHER';
  priority: number; // 0-100
  status: 'ACTIVE' | 'FULFILLED' | 'VOIDED';
}

/**
 * Edge Card: A verification token for a logistics node (e.g., a truck, 
 * a localized storage point, or a processing hub).
 */
export interface EdgeCard {
  id: string;
  type: 'EDGE_CARD';
  operatorId: string;
  capacity: number; // in standardized units
  currentLoad: number;
  status: 'AVAILABLE' | 'EN_ROUTE' | 'MAINTENANCE';
}

/**
 * Overflow Rail: A dynamic supply line that captures and moves gleaned goods
 * from sources of surplus to points of need.
 */
export interface OverflowRail {
  id: string;
  type: 'OVERFLOW_RAIL';
  sourceId: string; // e.g., a farm, a supermarket, or a factory
  targetArea: string; // Region or specific Edge Card
  throughput: number; // flow rate
  currentInventory: ResourceUnit[];
}

/**
 * Field Wallet: The receiver's interface for claiming and receipting provision.
 * Tracks the "Stewardship Receipt" chain.
 */
export interface FieldWallet {
  id: string;
  type: 'FIELD_WALLET';
  ownerId: string;
  receiptHistory: StewardshipReceipt[];
  activeAllocations: string[]; // IDs of ProvisionBatches
}

// ─── Logic & Process Primitives ──────────────────────────────────────────────

/**
 * Gleaning Session: An active process of capturing value from systemic overflow.
 */
export interface GleaningSession {
  id: string;
  type: 'GLEANING_SESSION';
  sourceId: string;
  startTime: number;
  endTime?: number;
  yield: ResourceUnit[];
  status: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

/**
 * Provision Batch: A curated set of resources routed to a specific receiver.
 */
export interface ProvisionBatch {
  id: string;
  type: 'PROVISION_BATCH';
  resources: ResourceUnit[];
  routeId: string;
  destinationWalletId: string;
  status: 'STAGED' | 'IN_TRANSIT' | 'ARRIVED' | 'CLAIMED';
}

/**
 * Stewardship Receipt: Cryptographic proof of provision reaching its receiver.
 */
export interface StewardshipReceipt {
  id: string; // BLAKE3 hash of receipt content
  provisionBatchId: string;
  receiverWalletId: string;
  timestamp: number;
  provenance: string[]; // Chain of Edge Cards
  signature: string; // Receiver's signature
}

// ─── Supporting Types ────────────────────────────────────────────────────────

export interface GeoLocation {
  lat: number;
  lng: number;
  radius?: number; // precision/privacy radius
}

export interface ResourceUnit {
  type: string;
  quantity: number;
  unit: string;
  expiry?: number;
  metadata?: Record<string, unknown>;
}

// ─── Provision-Routing Architecture ──────────────────────────────────────────

/**
 * Defines how provision is routed from an Overflow Rail to a Field Wallet.
 * Provision is incomplete until 'ARRIVED' and 'CLAIMED' states are reached.
 */
export interface ProvisionRoute {
  id: string;
  railId: string;
  targetWalletId: string;
  waypoints: string[]; // List of Edge Card IDs
  estimatedArrival: number;
  actualArrival?: number;
  isComplete: boolean; // Must be false until StewardshipReceipt is generated
}
