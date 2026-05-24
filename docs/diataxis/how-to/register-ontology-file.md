# How to Register an Ontology File

In a complex distributed system, maintaining a shared vocabulary is critical. The Proxyable architecture uses **Ontology Files** to define the semantic laws, object types, and relationships that govern your application, deeply inspired by Toyota Production System (TPS) principles of standardization and visual management.

This guide walks you through creating, registering, and validating an Ontology file in your project.

## Prerequisites

- `truex-core` installed.
- Understanding of Object-Centric Event Logging (OCEL 2.0).
- Familiarity with JSON Schema or TypeScript interfaces.

## Step 1: Create the Ontology File

An Ontology file (typically `ontology.json` or `ontology.ts`) describes the core entities in your system.

Create a new file named `manufacturing-ontology.json`:

```json
{
  "$schema": "https://proxyable.truex.io/schema/ontology-v1.json",
  "domain": "Manufacturing",
  "objects": {
    "WorkOrder": {
      "attributes": {
        "status": { "type": "string", "enum": ["PENDING", "IN_PROGRESS", "COMPLETED", "HALTED"] },
        "priority": { "type": "number", "minimum": 1, "maximum": 5 }
      }
    },
    "Machine": {
      "attributes": {
        "model": { "type": "string" },
        "maintenanceDue": { "type": "boolean" }
      }
    }
  },
  "events": {
    "StartProduction": {
      "requiredObjects": ["WorkOrder", "Machine"]
    },
    "JidokaHalt": {
      "requiredObjects": ["Machine"],
      "attributes": ["reasonCode"]
    }
  }
}
```

## Step 2: Register the Ontology

To enforce these rules at runtime, you must register the ontology with the Proxyable Governance engine. This ensures that any event logged or state mutated complies with your TPS standards.

Create an initialization script `init.ts`:

```typescript
import { OntologyRegistry } from 'truex-core/governance';
import * as path from 'path';
import * as fs from 'fs';

async function setupOntology() {
  const registry = new OntologyRegistry();
  
  const ontologyPath = path.resolve(__dirname, 'manufacturing-ontology.json');
  const ontologyData = JSON.parse(fs.readFileSync(ontologyPath, 'utf-8'));

  try {
    await registry.register(ontologyData);
    console.log('✅ Ontology registered successfully.');
  } catch (error) {
    console.error('❌ Failed to register ontology:', error.message);
    process.exit(1);
  }
}

setupOntology();
```

## Step 3: Terminal Commands

Run the initialization script to verify the registration:

```bash
# Compile and run the TypeScript file
npx tsx init.ts
```

### Expected Console Output

```bash
$ npx tsx init.ts
Validating ontology against schema...
Indexing objects: WorkOrder, Machine...
Indexing events: StartProduction, JidokaHalt...
✅ Ontology registered successfully.
```

## Step 4: Using the Ontology for OCEL Validation

Once registered, the ontology acts as a strict schema for your OCEL event logs. If a capability attempts to log an event that violates the ontology, it will be rejected.

```typescript
import { OCELLogger, OntologyRegistry } from 'truex-core';

const logger = new OCELLogger({ registry: OntologyRegistry.getInstance() });

// This will succeed
logger.logEvent({
  activity: 'StartProduction',
  objects: [
    { type: 'WorkOrder', id: 'WO-123' },
    { type: 'Machine', id: 'M-001' }
  ]
});

// This will FAIL and throw an OntologyViolationError
logger.logEvent({
  activity: 'StartProduction',
  objects: [
    { type: 'WorkOrder', id: 'WO-124' }
    // Missing 'Machine' object required by ontology
  ]
});
```

## Handling Edge Cases

### Edge Case 1: Schema Evolution
When updating the ontology, you may encounter backwards compatibility issues with existing event logs. Always version your ontology files (e.g., `ontology-v2.json`) and use the `OntologyRegistry.migrate()` utility when parsing historical OCEL data.

### Edge Case 2: Conflicting Definitions
If you attempt to register multiple ontologies with overlapping object definitions, the registry will throw a `ConflictError`. To resolve this, use namespaces in your domain definitions (e.g., `Manufacturing.Machine` vs. `Logistics.Machine`).

## TPS Connection

By registering an ontology, you are creating a **Standardized Work** definition for your software architecture. It prevents ad-hoc data structures from causing defects downstream, acting as a preventative Poka-Yoke (mistake-proofing) mechanism.
