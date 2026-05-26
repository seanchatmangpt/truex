# Storehouse Infrastructure

This package implements the core infrastructure for the TrueX Storehouse, focusing on the transition from a donation-based charity model to a **Stewardship Receipting** framework.

## The Product Wedge: Gleaning / Overflow Logic

The Storehouse does not rely on traditional donations. Instead, it utilizes **Gleaning / Overflow Logic** as its primary engine.

1.  **Systemic Capture:** We interface with industrial supply chains to identify "overflow"—resources that are technically surplus but functionally essential.
2.  **Gleaning Sessions:** Active, high-efficiency harvesting operations that capture this overflow before it exits the value chain (e.g., at the farm gate, the loading dock, or the retail edge).
3.  **Dynamic Valuation:** Unlike donations, which are often valued at $0 or liquidation prices, gleaned resources are valued by their **Utility to the Receiver**, tracked through Field Cards.

## Provision-Routing Architecture

The core architectural tenet of the Storehouse is that **Provision is Incomplete until Receipted**.

### The Routing Lifecycle
-   **Stage 1: Ingestion.** Resources enter an `OverflowRail` via a `GleaningSession`.
-   **Stage 2: Staging.** `ProvisionBatch` entities are created, matching available resources to the needs expressed by `FieldCards`.
-   **Stage 3: Transit.** `EdgeCards` (logistics nodes) move the provision through the network.
-   **Stage 4: Arrival.** The provision reaches the `FieldWallet` of the receiver.
-   **Stage 5: Receipting.** The receiver signs a `StewardshipReceipt`. ONLY at this point is the provision considered "Complete".

## Physical Primitives
-   **Field Cards:** Physical/Digital NFC tags or QR codes that represent a localized need.
-   **Edge Cards:** Hardware tokens held by logistics operators to verify custody transfer.
-   **Overflow Rails:** The virtualized representation of the physical supply lines.
-   **Field Wallets:** Mobile or hardware interfaces for receivers to manage their provisions and provenance.
