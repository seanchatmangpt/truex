# Summary: Geno: A Developer Tool for Authoring Multimodal Interaction on Existing Web Applications

**File:** Geno.pdf

## 1. Main Thesis
Geno is a developer-centric tool designed to lower the barrier for authoring multimodal (voice + GUI) interactions on existing web applications. It addresses the "NLP gap" for web developers by providing a high-level workflow that unifies intent specification, language model training through demonstration, and intent fulfillment via either programmatic function invocation or GUI action replay.

## 2. Key Findings
- **Reduction of Developer Friction:** Formative studies identified that refactoring existing codebases and the lack of NLP expertise are primary barriers. Geno abstracts these by allowing developers to "walk up and use" its IDE to wrap existing functionalities.
- **Unified Multimodal Workflow:** Geno treats voice as a first-class citizen alongside traditional GUI inputs, allowing for complex deictic references (e.g., "move *this* [hovered element] to next Tuesday").
- **Frame-Based Dialog Architecture:** The system uses a robust NLP pipeline (StarSpace for intent classification and CRF for entity extraction) to map natural language to structured "frames" or parameters.
- **Loose Coupling:** By design, Geno maintains a loose coupling with the application's internal logic, generating skeleton wrapper functions that developers can implement to maintain architectural integrity.
- **Contextual Parameter Extraction:** Geno can extract parameters from the DOM (e.g., `innerText`, `class`) based on developer demonstration, effectively binding the physical state of the UI to the semantic state of the voice command.
- **Automatic Disambiguation:** If parameters are missing or confidence is low, the system automatically initiates a follow-up dialog, ensuring the system reaches a deterministic state before execution.

## 3. Truex Grammar of Consequence Analysis

### Substrate (The Pre-Gall Application State)
The substrate consists of the existing web application's DOM and its underlying JavaScript execution environment. It represents the raw "Pre-Gall" state where interactions are singular and often disconnected from high-level intent.

### Membrane (The Geno Multimodal Controller)
Geno acts as a semantic membrane that encapsulates the existing application. It intercepts raw, probabilistic inputs (speech, mouse hovers, marquee selections) and filters them through a defined set of **Intents** and **Parameters**. This membrane ensures that only structured, recognized commands are allowed to influence the underlying substrate.

### Attempt (The Multimodal Command)
A user’s multimodal interaction (e.g., saying "Delete these" while marquee-selecting emails) is a high-level **Attempt** to mutate the system state. It represents a potential transition from one valid application state to another.

### Admit / Refuse (Intent Matching)
The Geno NLP engine performs the **Admission** function. An interaction is **Admitted** if the intent classification confidence exceeds a specific threshold (e.g., 50%) and all required parameters are successfully resolved from either the voice utterance or the GUI context. If parameters are missing or the intent is ambiguous, the system **Refuses** immediate execution and instead prompts for a corrective **Attempt** (clarification).

### Receipt (Action Execution)
The **Receipt** is the deterministic consequence of the Admitted intent. It manifests as the execution of a verified JavaScript function or the precise replay of recorded GUI actions. The `geno.say()` function provides a verbal receipt, confirming the state transition to the user.

## 4. Relevance to Truex Post-Gall Operating Substrate
Geno serves as a specialized "multimodal admission controller" for the Truex substrate. It provides a blueprint for how a **Post-Gall Operating Substrate** can ingest high-entropy, human-centric inputs and convert them into low-entropy, deterministic consequences. By binding natural language to verified code paths and GUI invariants, Geno enables the creation of an **Active Computational Membrane** that enforces the 'Truex Grammar of Consequence' across heterogeneous interaction modalities.
