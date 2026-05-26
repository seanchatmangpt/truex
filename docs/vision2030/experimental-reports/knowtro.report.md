# Experimental Project Report: knowtro

> **Status:** Analyzed as part of the Vision 2030 Global Audit
> **Path:** `/Users/sac/knowtro`

## 1. Audit Status
- **Test Status:** ❌ Failing / Broken Build

## 2. Executable Entry Points
- `knowtro/docs/package.json`
- `knowtro/examples/api-routes/package.json`
- `knowtro/examples/auto-imports/package.json`
- `knowtro/examples/cached-handler/package.json`
- `knowtro/examples/custom-error-handler/package.json`
- `knowtro/examples/database/package.json`
- `knowtro/examples/graceful-shutdown/package.json`
- `knowtro/examples/hello-world/package.json`
- `knowtro/examples/middleware/package.json`
- `knowtro/examples/nano-jsx/package.json`
- `knowtro/examples/plugins/package.json`
- `knowtro/examples/renderer/package.json`
- `knowtro/examples/websocket/package.json`
- `knowtro/package.json`
- `knowtro/playground/package.json`
- `knowtro/scripts/release-nightly.sh`

## 3. Extracted Documentation & Context
### Source: `knowtro/CHANGELOG.md`
```markdown
# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## v2.11.6

[compare changes](https://github.com/nitrojs/nitro/compare/v2.11.5...v2.11.6)

### 🩹 Fixes

- Update enenv and cloudflare node compat ([#3187](https://github.com/nitrojs/nitro/pull/3187))
- **dev:** Use port for bun on windows ([#3188](https://github.com/nitrojs/nitro/pull/3188))

### 💅 Refactors

- Remove extra space in logs ([#3181](https://github.com/nitrojs/nitro/pull/3181))
- Remove dependency on unenv mock utils ([#3186](https://github.com/nitrojs/nitro/pull/3186))

### 📖 Documentation

- **deploy:** Add warning about turborepo and zero config ([#3182](https://github.com/nitrojs/nitro/pull/3182))
- **vercel:** Typo ([#3183](https://github.com/nitrojs/nitro/pull/3183))
- **fetch:** Fix grammar ([#3184](https://github.com/nitrojs/nitro/pull/3184))

### 🏡 Chore

- **release:** V2.11.5 ([8099ed86](https://github.com/nitrojs/nitro/commit/8099ed86))
- Remove unused file ([8de0e8f3](https://github.com/nitrojs/nitro/commit/8de0e8f3))
- Update minor dependencies and lock ([75d0d826](https://github.com/nitrojs/nitro/commit/75d0d826))
- Update lock ([c2f8d066](https://github.com/nitrojs/nitro/commit/c2f8d066))
- Update unenv ([b26d2b5a](https://github.com/nitrojs/nitro/commit/b26d2b5a))

### ✅ Tests

- Update cloudflare-module ([0f3e4a3b](https://github.com/nitrojs/nitro/commit/0f3e4a3b))

### ❤️ Contributors

- Pooya Parsa ([@pi0](https://github.com/pi0))
- Nandesora Tjihero ([@Ombuweb](https://github.com/Ombuweb))
...
```

### Source: `knowtro/CODE_OF_CONDUCT.md`
```markdown
# Contributor Covenant Code of Conduct

## Our Pledge

We as members, contributors, and leaders pledge to make participation in our
community a harassment-free experience for everyone, regardless of age, body
size, visible or invisible disability, ethnicity, sex characteristics, gender
identity and expression, level of experience, education, socio-economic status,
nationality, personal appearance, race, religion, or sexual identity
and orientation.

We pledge to act and interact in ways that contribute to an open, welcoming,
diverse, inclusive, and healthy community.

## Our Standards

Examples of behavior that contributes to a positive environment for our
community include:

* Demonstrating empathy and kindness toward other people
* Being respectful of differing opinions, viewpoints, and experiences
* Giving and gracefully accepting constructive feedback
* Accepting responsibility and apologizing to those affected by our mistakes,
  and learning from the experience
* Focusing on what is best not just for us as individuals, but for the
  overall community

Examples of unacceptable behavior include:

* The use of sexualized language or imagery, and sexual attention or
  advances of any kind
* Trolling, insulting or derogatory comments, and personal or political attacks
* Public or private harassment
* Publishing others' private information, such as a physical or email
  address, without their explicit permission
* Other conduct which could reasonably be considered inappropriate in a
  professional setting

## Enforcement Responsibilities

...
```

### Source: `knowtro/CONTRIBUTING.md`
```markdown
# Contribution Guide

<!-- https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/setting-guidelines-for-repository-contributors -->

> All contributors lead the growth of Nitro - including you!

## Discussions

You can involve in discussions using:

- [GitHub Discussions](discussions)
- [Nitro Discord](https://discord.nitro.build)

## Contribute to the Code

> [!IMPORTANT]
> Please discuss your ideas with the maintainers before opening a pull request.

### Local Development

- Clone the [`nitrojs/nitro`](https://github.com/nitrojs/nitro) git repository.
- Install the latest LTS version of [Node.js](https://nodejs.org/en/) (v22+).
- Enable [corepack](https://github.com/nodejs/corepack) using `corepack enable` (run `npm i -g corepack` if it's not available).
- Install dependencies using `pnpm install`.
- Build the project in stub mode using `pnpm build --stub`.
- Run the playground with `pnpm nitro dev ./playground` to verify changes.
- Add, modify, and run tests using `pnpm test`.
  - Tip: Run `pnpm vitest test/presets/node.test.ts` for quick testing.

## Reporting Issues

You might encounter a bug while using Nitro.

Although we aim to resolve all known issues, new bugs can emerge over time. Your bug report helps us find and fix them faster — even if you're unable to fix the underlying code yourself.

Here’s how to report a bug effectively:

### Ensure It's a Bug

Sometimes what seems like a bug may actually be expected behavior or a missing feature. Make sure you’re reporting an actual bug by creating a minimal nitro project and reducing scope.
...
```

*(Plus 22 other markdown files)*
