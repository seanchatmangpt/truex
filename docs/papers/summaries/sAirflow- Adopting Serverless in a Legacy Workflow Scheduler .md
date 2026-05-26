# Summary: sAirflow: Adopting Serverless in a Legacy Workflow Scheduler

## Main Thesis
This paper introduces sAirflow, a serverless adaptation of the industry-standard Apache Airflow workflow scheduler. The research details a migration strategy for legacy, database-driven applications that utilizes Change Data Capture (CDC) and message queues to transform polling-based architectures into event-driven control planes. By migrating both the control plane and workers to FaaS (Function-as-a-Service) and CaaS (Container-as-a-Service), sAirflow aims to achieve massive horizontal scalability and a significant reduction in operational "toil" and monetary costs.

## Key Findings
- **Event-Driven Transformation:** sAirflow replaces the always-on Airflow scheduler thread with a serverless function (AWS Lambda) triggered by CDC events from the metadata database, eliminating idle resource consumption.
- **Rapid Scaling Surface:** The system scales to 125 workers in seconds, whereas managed solutions (MWAA) take minutes to provision nodes, resulting in a makespan reduction of up to 7x for highly parallel workloads.
- **Economic Efficiency:** Experimental results show that sAirflow halves fixed daily costs and reduces total costs by 17-48% for sporadic workloads, aligning infrastructure expenditure directly with actuation volume.
- **Architectural Bottlenecks:** The research identifies CDC latency (1-1.5s) as a critical bottleneck for sequential workflows, highlighting the structural tension between transactional database reliance and real-time event-driven responsiveness.

## Truex Post-Gall Relevance
sAirflow provides a technical bridge for migrating legacy "pre-Gall" systems into the **Truex Post-Gall Operating Substrate**:
- **CDC as the Actuation Hook:** The Change Data Capture mechanism serves as a foundational **Truex Hook**. It intercepts an operational delta (SQL update) and emits a **Receipt**-like event that establishes the authority for subsequent scheduling **Consequences**.
- **Deterministic Admission (`μ`):** By replacing polling with event-triggers, the scheduler becomes a **Deterministic Admission Function**. It only performs the measurement function when a lawful state transition occurs, moving the system toward the Truex goal of "zero humans in runtime actuation."
- **Serverless Consequence Cells:** Each worker invocation (Lambda or Fargate) represents an isolated **Membrane** executing a **Consequence Cell**. It ingests an **Attempt** (task metadata), produces a durable motion, and leaves behind a **Replayable** log as proof of completion.
- **Economic Inversion (CPVA):** sAirflow’s pay-as-you-use model is a direct application of the Truex CPVA (Cost Per Validated Actuation) optimization strategy, where the system minimizes the "cost per ticket" by only consuming resources during receipted, promotion-safe execution.
- **Substrate Reliability:** The reliance on cloud-native FaaS guarantees for execution stability reflects the Truex mandate: "No receipt, no authority; no replay, no substrate."
