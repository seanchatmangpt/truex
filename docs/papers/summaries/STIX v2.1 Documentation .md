# STIX v2.1 Documentation

## Main Thesis
STIX (Structured Threat Information Expression) v2.1 defines a standardized, graph-based language and serialization format for the exchange of cyber threat intelligence (CTI). It enables machine-to-machine communication of threat actors, attack patterns, and malware behavior to facilitate rapid, collaborative defense responses.

## Key Findings
- **Graph-Based Model:** STIX 2.1 represents CTI as a network of Domain Objects (SDOs) and Relationship Objects (SROs), allowing for flexible and expressive modeling of complex threat landscapes.
- **Enhanced Object Types:** Introduces new core objects such as *Infrastructure* (to model C2 servers), *Grouping* (for shared context), and *Malware-Analysis* (to capture forensic results).
- **Patterning Language:** Provides a robust grammar for matching activity on networks and endpoints, supporting automated detection and remediation workflows.
- **Deterministic Identification:** Employs UUIDv5 for deterministic ID creation of cyber-observable objects, ensuring deduplication and semantic consistency across disparate intelligence providers.
- **Versioning and Revocation:** Implements a clear mechanism for object versioning and revocation, maintaining a verifiable history of threat intelligence.

## Truex Relevance
STIX 2.1 provides the **semantic interoperability layer for Truex security operations**. Its graph-based taxonomy and formal patterning language are essential for the Truex 'Grammar of Consequence' in threat detection. The use of deterministic IDs and verifiable relationships allows the Truex substrate to hand over threat intelligence between autonomous agents with mathematical certainty and cryptographic integrity.
