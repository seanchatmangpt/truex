# Time-Probability Dependent Knowledge Extraction in IoT-enabled Smart Building

## 1. Main Thesis
The paper proposes a practical inference framework for extracting "status-to-event" knowledge in smart building environments. By integrating heterogeneous IoT sensor data with an ontology-based spatial model and a time-probability dependent extraction method, the research enables the automatic detection of abnormal events and the correlation of multiple discrete events into high-level user trajectories (e.g., linking room occupancy to elevator usage).

## 2. Key Findings
- **Interoperability through Unified API:** A standardized API utilizing 'ucode' identifiers effectively bridges the gap between diverse IoT hardware platforms and networking protocols from multiple vendors.
- **Ontological Spatial Modeling:** The **Building Topology Ontology (BOT)**, implemented in OWL DL, provides a robust framework for modeling the physical and semantic relationships between floors, rooms, zones, and sensors.
- **Probabilistic Event Inference:** The framework successfully extracts two types of knowledge:
    - **Timestamp-based Probability:** Identifies abnormal events (e.g., unusual room occupancy) by comparing current event times against historical probability density functions.
    - **Time Interval-based Probability:** Detects "Event Conjunctions" (correlated sequences), such as a user turning off a room light and subsequently arriving at an elevator floor.
- **Distance-Logic Optimization:** Using distance-based linear regression (calculating hops in the ontology graph), the system can precisely estimate the expected time intervals between conjunctive events, improving the accuracy of intent-based building control.
- **Predictive Automation:** The numerical results demonstrate that inferred user trajectories can be used to trigger proactive building responses, such as pre-calling elevators to reduce waiting times.

## 3. Truex Grammar of Consequence Analysis
- **Commitments (Inputs):** The system's commitments are the raw telemetry streams from light switches and elevators, paired with the static Building Topology "Law" (BOT).
- **Expectations (Outputs):** The expected consequences are inferred semantic events, such as "Occupancy State" or "User Trajectory," and associated probability scores.
- **Consequence-Driven Selection:** The "Conjunction Law" (Equation 3) selects whether two events are related based on the probability of their temporal consequence, essentially forming a state-based link between discrete sensor observations.
- **Mechanical Invariants:** The system treats building behavior as a set of probabilistic invariants. When an event deviates from the "Normal" threshold (p-bar), the invariant is flagged as violated (Abnormal), requiring a management response.

## 4. Relevance to Truex Post-Gall Operating Substrate
This research provides the **Spatio-Temporal Logic** necessary for the Truex substrate to manage physical environments. By transforming raw sensor data into a "Law-Aware" Knowledge Graph (stored in RDF via SPARQL), the substrate can mechanically verify the state of its physical infrastructure. It replaces manual facility monitoring with a deterministic engine that enforces behavioral and spatial invariants. This allows the operating substrate to maintain absolute situational awareness across both its digital and physical domains, ensuring that every physical event is a "Recognized Receipt" within the system's ledger of consequences.
