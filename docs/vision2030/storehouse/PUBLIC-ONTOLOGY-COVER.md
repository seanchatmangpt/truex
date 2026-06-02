# Vector 2: Public Ontology Cover (The World-Schema)

> **Objective:** Establishing the canonical stack of RDF/OWL vocabularies used to model the closed-loop internal ledger (Storehouse). This is how the Source touches the world without private schema collapse.

Storehouse does not invent proprietary schemas for finance, organizations, people, or provenance. Instead, we use a **layered reuse approach** relying on W3C Recommendations, OGC/ISO standards, and active community schemas. This guarantees that every domain Storehouse touches becomes public-ontology-addressable.

## 1. Core Ontologies by Domain

### People, Identities & Organizations
*   **FOAF (Friend-of-a-Friend):** Core ontology for persons and agents (`foaf:Person`, `foaf:Agent`).
*   **ORG (W3C Organization):** Core ontology for organizational structures, ministries, and funds (`org:Organization`, `org:FormalOrganization`, `org:hasUnit`).
*   **vCard / Schema.org (Person/Org):** Used for supplementary contact details and web-widespread interoperability.

### Finance & Payments
*   **FIBO (Financial Industry Business Ontology):** Deep financial coverage. We use FIBO for formal financial rigor (`fibo-be-oac:Account`, `fibo-fnd-acc-cur:MonetaryAmount`).
*   **Schema.org (Commerce):** Used for publishing invoices and payments to the web (`schema:MonetaryAmount`, `schema:Invoice`).

### Provenance, Audit, Receipts
*   **PROV-O (W3C Provenance):** The bedrock of our receipt system. We model Storehouse Units as `prov:Entity` and transfers as `prov:Activity`. This strictly records "who did what when."

### Controlled Vocabularies & Time
*   **SKOS (Simple Knowledge Organization System):** Used for maintaining taxonomies, funding categories, and industry codes.
*   **OWL-Time:** Used for intervals and timestamps associated with receipts.

## 2. Integration Strategy & Layering

Our schema approach follows strict mapping patterns to prevent collisions while maximizing expressiveness. We use **multiple typing** on core entities.

*   **A Receiver:** Might be typed as both `foaf:Person` and `schema:Person`.
*   **A Fund:** Typed as `org:FormalOrganization` with a `skos:prefLabel`.
*   **A Transfer:** Typed as both `fibo:fbc-fct-cfs:CashFlow` and `prov:Activity`.

## 3. Implementation: Storehouse SHACL Shapes

To guarantee the structural integrity of the Ark, we validate all incoming state mutations against SHACL shapes before admitting them to the ledger.

**Example: The Storehouse Unit Shape**
```turtle
ex:StorehouseUnitShape
    a sh:NodeShape ;
    sh:targetClass ex:StorehouseUnit ;
    sh:property [
        sh:path fibo:fnd-acc-acc:hasAmount ;
        sh:datatype xsd:decimal ;
        sh:minCount 1 ;
    ] ;
    sh:property [
        sh:path fibo:fnd-acc-cur:hasCurrency ;
        sh:datatype xsd:string ;
        sh:minCount 1 ;
    ] ;
    sh:property [
        sh:path prov:generatedAtTime ;
        sh:datatype xsd:dateTime ;
        sh:minCount 1 ;
    ] .
```

**Example: The Stewardship Receipt Shape**
```turtle
ex:ReceiptShape
    a sh:NodeShape ;
    sh:targetClass schema:Invoice ;
    sh:property [
        sh:path schema:totalPaymentDue ;
        sh:nodeKind sh:Literal ;
        sh:minCount 1 ;
    ] ;
    sh:property [
        sh:path dcterms:issued ;
        sh:datatype xsd:dateTime ;
    ] ;
    sh:property [
        sh:path prov:wasGeneratedBy ;
        sh:class ex:StorehouseUnit ;
    ] .
```

## 4. The Theological Implication of Public Schemas

By mapping Kingdom provision (the Source) into FOAF, ORG, PROV-O, and FIBO, Storehouse explicitly claims that biblical stewardship is not a separate, alternative reality. It operates over the exact same physical and financial reality the world observes, but routes it according to a higher law. 

We do not hide behind a private "church database schema." We bind public names under `Bible-as-O*`.