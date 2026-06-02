# Experimental Project Report: zoela

> **Status:** Analyzed as part of the Vision 2030 Global Audit
> **Path:** `/Users/sac/zoela`

## 1. Audit Status
- **Test Status:** ❌ Failing / Broken Build

## 2. Executable Entry Points
- `zoela/package.json`
- `zoela/android/gradlew`
- `zoela/scripts/check-banned-words.sh`
- `zoela/scripts/reset-project.js`
- `zoela/scripts/verify-completeness.js`
- `zoela/scripts/trigger-realtime.ts`
- `zoela/scripts/trigger-andon-storm.ts`
- `zoela/scripts/stress-test.ts`
- `zoela/scripts/route-proof/assert-local-stack.ts`
- `zoela/scripts/route-proof/emit-route-proof-manifest.ts`
- `zoela/scripts/route-proof/shift-observed.ts`
- `zoela/scripts/route-proof/verify-device-route-proof.ts`
- `zoela/scripts/orientation/build-master-map.ts`
- `zoela/scripts/orientation/build-present.ts`
- `zoela/scripts/orientation/compare-target-present.ts`
- `zoela/scripts/orientation/dashboard.ts`
- `zoela/scripts/orientation/heatmap.ts`
- `zoela/scripts/orientation/populate-diagrams.ts`
- `zoela/scripts/orientation/scan-env.ts`
- `zoela/scripts/orientation/scan-maestro.ts`
- `zoela/scripts/orientation/scan-physical.ts`
- `zoela/scripts/orientation/scan-pro.ts`
- `zoela/scripts/orientation/scan-repo.ts`
- `zoela/scripts/orientation/scan-routes.ts`
- `zoela/scripts/orientation/scan-runtime-evidence.ts`
- `zoela/scripts/orientation/scan-selectors.ts`
- `zoela/scripts/orientation/scan-tests.ts`
- `zoela/scripts/orientation/verify-orientation.ts`

## 3. Extracted Documentation & Context

### Vector Mapping: Vector 3 (Projection Surfaces)
ZOELA serves as an iOS/Android client application built with Expo (React Native) and a Supabase backend. It acts as the "Mobile Scout" client, which functions directly as a Vector 3 (Projection Surface) within the TrueX Vision 2030 ecosystem. Its primary architectural value lies in rendering the backend state and processes as highly responsive, context-aware, and role-scoped interfaces (such as guests, anonymous seekers in the Quiet Room, connection group coordinators, donors, volunteers, and staff supervisors on the admin/andon dashboard).

Key characteristics matching Vector 3:
- **Progressive Disclosure Surfaces:** Implements an Identity Ladder (from Public Guest to Staff Admin) where UI screens adapt to the user's level of trust/identity.
- **Biometric and Verification Gateways:** Integrates Apple/Google SSO and local biometrics for staff elevation.
- **Cryptographic Receipt Visualizers:** Renders UI panels for verifying `DeviceRouteProofReceipt` hashes, exposing local-first data integrity (BLAKE3-chained events) to the end user.
- **Offline / Local-First Continuity:** Projects local SQLite state via Drizzle ORM, with local conflict resolution indicators (e.g. `OfflineSyncBanner`), ensuring availability even during network disruptions.

---

### Source: `zoela/docs/architecture/00_master_capability_map.md`
```markdown
# ZOELA Master Capability Map

ZOELA is a **capability-complete church participation system**, not just "an app with screens."

The correct unit of operation is:
`[ Need → Route → Disclosure Boundary → Action → Receipt ]`

**ZOELA = guest-first, identity-progressive, receipt-backed church participation and care operating system.**

---

## 1. Core Operating Doctrine

### Product Invariants

1. No account wall before hospitality.
2. Anonymous routes are allowed for private care, prayer, confession-like disclosure, and exploration.
3. No unauthenticated group chat.
4. Identity is route-scoped, not global by default.
5. The church becomes accountable before the person becomes identifiable.
6. Care is not closed unless a receipt admits response or lawful refusal.
7. Every route declares its disclosure boundary.
8. Every route declares whether identity is `None`, `LocalContinuity`, `ContactCapability`, `NamedCoordination`, `FinancialReceipt`, `MembershipCovenant`, `Safeguarding`, or `StaffAuthority`.

### Primary Theorem

> Belonging before database.
> Care before capture.
> Receipt before identity.
```

---

### Source: `zoela/docs/architecture/supabase-vision-2030.md`
```markdown
# Supabase Vision 2030 Architecture

This document defines the integration of Supabase capability lanes into the **ZOE LA Mobile Scout** runtime. Each capability is treated as a dormant production cell with specific boundaries, schemas, failure modes, and visible verification receipts.

---

## 1. pgvector — Meaning-Bearing Matching & Precedent Retrieval

### Route Role

- Suggests candidate route matches (Connect Groups, pastoral precedents, blocker history) based on semantic proximity to anonymized notice projections. Vector matching is a recommendation input; the final admission and route movement remain bound by route law and human care leads.

### Tables

```sql
CREATE TABLE IF NOT EXISTS public.care_route_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES public.service_routes(id) ON DELETE CASCADE,
  projection_hash TEXT NOT NULL,
  embedding vector(1536) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```
```

---

### Source: `zoela/AGENTS.md`
```markdown
# COMBINATORIAL MAXIMALISM

## Core Directives for Agent Behavior

1. **No Stubs, No Mocks, No Placeholders**: You must write fully realized, production-ready, and verifiable code. If you introduce a feature, you must implement every branch, edge case, and dependency to completion.
2. **Exhaustive Integration**: Every UI component must be wired to the state layer (Zustand), persisted to the local database (Drizzle/SQLite), synced to the remote backend (Supabase/Postgres), and covered by integration tests.
3. **Combinatorial Completeness**: You must consider the combinatorial explosion of states. If a route can be "active", "blocked", or "resolved", you must handle the UI, state, and sync implications for every possible permutation.
4. **Assume High-Stakes Production**: Treat every commit as if it is deploying to a Fortune 500 environment on Sunday morning. "It looks okay" is unacceptable. It must be mathematically and procedurally sound.
5. **No Laziness**: Do not summarize or shortcut implementations. Do not leave "TODOs". Build the whole thing.
```

---

### Source: `zoela/docs/diagrams/00-repo-inventory.md`
```markdown
# Phase 0: Repository Inventory

| Area             | Evidence                                                  | Files                                                            | Confidence | Notes                         |
| ---------------- | --------------------------------------------------------- | ---------------------------------------------------------------- | ---------- | ----------------------------- |
| Package Manager  | `package-lock.json` present                               | `package.json`, `package-lock.json`                              | Medium     | NPM                           |
| Expo SDK         | SDK 55                                                    | `package.json`, `app.config.ts`                                  | Medium     |                               |
| React Native     | 0.83.6                                                    | `package.json`                                                   | Medium     |                               |
| Expo Router      | Usage of `expo-router` dependency and `src/app` directory | `package.json`, `src/app/`                                       | Medium     | File-based routing            |
| Data Layer       | Drizzle ORM + SQLite                                      | `package.json`, `src/lib/db.ts`, `src/lib/schema.ts`             | Medium     | Local-first focus             |
| Sync Engine      | Custom CDC and Push/Pull logic                            | `src/lib/sync.ts`                                                | Medium     | Mirroring Supabase            |
| Auth             | Supabase Auth + Biometrics                                | `src/contexts/AuthContext.tsx`, `src/lib/biometrics.ts`          | Medium     |                               |
```

*(Plus 38 other markdown files)*
