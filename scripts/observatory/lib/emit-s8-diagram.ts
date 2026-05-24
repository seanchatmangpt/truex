/**
 * @module emit-s8-diagram
 * @description
 * Gall Classification: S8 Diagram Emitter
 * Purpose: Generates a Mermaid trace diagram for S8 Telco Ingestion and Wizard Counterfactual Simulation flows.
 */
import { fileURLToPath } from 'node:url';
import { FactEmitter, EmitterMetadata } from './fact-emitter.js';

const DIAGRAM_PATH = 'docs/v1/latest/diagrams/s8-trace.mmd';

/**
 * Emitter for generating the S8 (Telco & Wizard) architecture Mermaid diagram.
 */
export class S8DiagramEmitter extends FactEmitter {
  getMetadata(): EmitterMetadata {
    return {
      name: 'S8 Diagram Emitter',
      description: 'Generates a Mermaid trace diagram for S8 Telco Ingestion and Wizard Counterfactual Simulation flows',
      outputPath: DIAGRAM_PATH
    };
  }

  protected collectFacts() {
    return `
flowchart TB
    subgraph TelcoFlow ["Telco Agent (OCEL Event Logging)"]
        direction TB
        T_Mutation([State Transition Mutation]) --> T_Proxy[Create OCEL Proxy]
        T_Proxy --> T_Collect[OCEL Collector Events]
        T_Collect --> T_Envelope[Sign Envelope & Hash]
        T_Envelope --> T_Verify{Verify Envelope Cryptographic Signature}
        T_Verify -->|Pass| T_Store[Unforgeable Receipt Chaining]
        T_Verify -->|Fail| T_Tampered[Refusal & Divergence Alert]
    end

    subgraph WizardFlow ["Wizard Agent (Counterfactual Simulation)"]
        direction TB
        W_State([Initial State Setup]) --> W_Proxy[Create Invariant & Tx Proxy]
        W_Proxy --> W_Mutate[Speculative Mutation]
        W_Mutate --> W_Enforce{Verify Invariant Constraints}
        W_Enforce -->|Pass| W_Commit[Commit Transaction & Persist State]
        W_Enforce -->|Fail| W_Rollback[Rollback Transaction & Restore Original State]
    end

    T_Store -.->|Causal receipt reference| W_Mutate

    %% Styling
    classDef telco fill:#e3f2fd,stroke:#1565c0,stroke-width:2px;
    classDef wizard fill:#fffde7,stroke:#fbc02d,stroke-width:2px;
    classDef failure fill:#ffebee,stroke:#c62828,stroke-width:2px;

    class T_Mutation,T_Proxy,T_Collect,T_Envelope,T_Verify,T_Store telco;
    class T_Tampered failure;
    class W_State,W_Proxy,W_Mutate,W_Enforce,W_Commit wizard;
    class W_Rollback failure;
`.trim();
  }
}

/**
 * Generates and writes the S8 trace flow Mermaid diagram.
 * @returns A promise resolving to the diagram content.
 */
export async function emitS8Diagram() {
  const emitter = new S8DiagramEmitter();
  return emitter.emit();
}

const isMain = process.argv[1] && (
  process.argv[1].endsWith('emit-s8-diagram.ts') || 
  process.argv[1].endsWith('emit-s8-diagram.js') ||
  process.argv[1] === fileURLToPath(import.meta.url)
);

if (isMain) {
  await emitS8Diagram();
}
