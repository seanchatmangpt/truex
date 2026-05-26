# Experimental Project Report: zoela

> **Status:** Analyzed as part of the Vision 2030 Global Audit
> **Path:** `/Users/sac/zoela`

## 1. Audit Status
- **Test Status:** ❌ Failing / Broken Build

## 2. Executable Entry Points
- `zoela/lib/commonjs/package.json`
- `zoela/package.json`
- `zoela/scripts/check-banned-words.sh`
- `zoela/supabase/reset.sh`
- `zoela/supabase/tests/test-auth-keys.sh`
- `zoela/supabase/tests/test-container-logs.sh`
- `zoela/supabase/tests/test-pg17-upgrade.sh`
- `zoela/supabase/tests/test-s3-backend.sh`
- `zoela/supabase/tests/test-s3.sh`
- `zoela/supabase/tests/test-self-hosted.sh`
- `zoela/supabase/utils/add-new-auth-keys.sh`
- `zoela/supabase/utils/db-passwd.sh`
- `zoela/supabase/utils/generate-keys.sh`
- `zoela/supabase/utils/reassign-owner.sh`
- `zoela/supabase/utils/rotate-new-api-keys.sh`
- `zoela/supabase/utils/upgrade-pg17.sh`

## 3. Extracted Documentation & Context
### Source: `zoela/AGENTS.md`
```markdown
# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v55.0.0/ before writing any code.

# COMBINATORIAL MAXIMALISM

## Core Directives for Agent Behavior

1. **No Stubs, No Mocks, No Placeholders**: You must write fully realized, production-ready, and verifiable code. If you introduce a feature, you must implement every branch, edge case, and dependency to completion.
2. **Exhaustive Integration**: Every UI component must be wired to the state layer (Zustand), persisted to the local database (Drizzle/SQLite), synced to the remote backend (Supabase/Postgres), and covered by integration tests.
3. **Combinatorial Completeness**: You must consider the combinatorial explosion of states. If a route can be "active", "blocked", or "resolved", you must handle the UI, state, and sync implications for every possible permutation.
4. **Assume High-Stakes Production**: Treat every commit as if it is deploying to a Fortune 500 environment on Sunday morning. "It looks okay" is unacceptable. It must be mathematically and procedurally sound.
5. **No Laziness**: Do not summarize or shortcut implementations. Do not leave "TODOs". Build the whole thing.
6. **Regulatory Supremacy**: Whenever there is a concern regarding cryptography, data privacy, or algorithmic decision-making, the system must exceed NIST standards (e.g., FIPS 203/204 Post-Quantum compliance) and be strictly compliant with the EU AI Act (ensuring human oversight, transparent risk categorization, and immutable audit trails).

## Expo Route Proof Rule

Do not call UI emulation route proof.

React Native Testing Library, Jest, react-test-renderer, fake emitters, injected props, and renderer trees are ComponentSanityOnly.

Full JTBD route proof requires:

1. Real app target:
   - iOS Simulator
   - Android Emulator
   - physical device
   - Expo development or preview build

2. Real route:
   - user/device action
   - local SQLite write
   - sync queue
   - Edge Function where applicable
   - Supabase Postgres
   - realtime/CDC or explicit sync return
   - local receipt upsert
   - visible UI assertion

3. Real evidence:
...
```

### Source: `zoela/CLAUDE.md`
```markdown
@AGENTS.md

...
```

### Source: `zoela/README.md`
```markdown
# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
...
```

*(Plus 42 other markdown files)*
