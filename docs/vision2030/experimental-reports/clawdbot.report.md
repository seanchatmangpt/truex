# Experimental Project Report: clawdbot

> **Status:** Analyzed as part of the Vision 2030 Global Audit
> **Path:** `/Users/sac/clawdbot`

## 1. Audit Status
- **Test Status:** ❌ Failing / Broken Build

## 2. Executable Entry Points
- `clawdbot/Swabble/scripts/format.sh`
- `clawdbot/Swabble/scripts/lint.sh`
- `clawdbot/docker-setup.sh`
- `clawdbot/extensions/bluebubbles/package.json`
- `clawdbot/extensions/copilot-proxy/package.json`
- `clawdbot/extensions/diagnostics-otel/package.json`
- `clawdbot/extensions/discord/package.json`
- `clawdbot/extensions/google-antigravity-auth/package.json`
- `clawdbot/extensions/google-gemini-cli-auth/package.json`
- `clawdbot/extensions/googlechat/package.json`
- `clawdbot/extensions/imessage/package.json`
- `clawdbot/extensions/line/package.json`
- `clawdbot/extensions/llm-task/package.json`
- `clawdbot/extensions/lobster/package.json`
- `clawdbot/extensions/matrix/package.json`
- `clawdbot/extensions/mattermost/package.json`
- `clawdbot/extensions/memory-core/package.json`
- `clawdbot/extensions/memory-lancedb/package.json`
- `clawdbot/extensions/msteams/package.json`
- `clawdbot/extensions/nextcloud-talk/package.json`
- `clawdbot/extensions/nostr/package.json`
- `clawdbot/extensions/open-prose/package.json`
- `clawdbot/extensions/signal/package.json`
- `clawdbot/extensions/slack/package.json`
- `clawdbot/extensions/telegram/package.json`
- `clawdbot/extensions/tlon/package.json`
- `clawdbot/extensions/voice-call/package.json`
- `clawdbot/extensions/whatsapp/package.json`
- `clawdbot/extensions/zalo/package.json`
- `clawdbot/extensions/zalouser/package.json`
- `clawdbot/package.json`
- `clawdbot/scripts/auth-monitor.sh`
- `clawdbot/scripts/build-and-run-mac.sh`
- `clawdbot/scripts/build_icon.sh`
- `clawdbot/scripts/bundle-a2ui.sh`
- `clawdbot/scripts/changelog-to-html.sh`
- `clawdbot/scripts/claude-auth-status.sh`
- `clawdbot/scripts/clawlog.sh`
- `clawdbot/scripts/codesign-mac-app.sh`
- `clawdbot/scripts/create-dmg.sh`
- `clawdbot/scripts/e2e/doctor-install-switch-docker.sh`
- `clawdbot/scripts/e2e/gateway-network-docker.sh`
- `clawdbot/scripts/e2e/onboard-docker.sh`
- `clawdbot/scripts/e2e/plugins-docker.sh`
- `clawdbot/scripts/e2e/qr-import-docker.sh`
- `clawdbot/scripts/ios-team-id.sh`
- `clawdbot/scripts/make_appcast.sh`
- `clawdbot/scripts/mobile-reauth.sh`
- `clawdbot/scripts/notarize-mac-artifact.sh`
- `clawdbot/scripts/package-mac-app.sh`
- `clawdbot/scripts/package-mac-dist.sh`
- `clawdbot/scripts/pre-commit/run-node-tool.sh`
- `clawdbot/scripts/restart-mac.sh`
- `clawdbot/scripts/sandbox-browser-entrypoint.sh`
- `clawdbot/scripts/sandbox-browser-setup.sh`
- `clawdbot/scripts/sandbox-common-setup.sh`
- `clawdbot/scripts/sandbox-setup.sh`
- `clawdbot/scripts/setup-auth-system.sh`
- `clawdbot/scripts/termux-auth-widget.sh`
- `clawdbot/scripts/termux-quick-auth.sh`
- `clawdbot/scripts/termux-sync-widget.sh`
- `clawdbot/scripts/test-cleanup-docker.sh`
- `clawdbot/scripts/test-install-sh-docker.sh`
- `clawdbot/scripts/test-install-sh-e2e-docker.sh`
- `clawdbot/scripts/test-live-gateway-models-docker.sh`
- `clawdbot/scripts/test-live-models-docker.sh`
- `clawdbot/ui/package.json`

## 3. Extracted Documentation & Context
### Source: `clawdbot/AGENTS.md`
```markdown
# Repository Guidelines
- Repo: https://github.com/clawdbot/clawdbot
- GitHub issues/comments/PR comments: use literal multiline strings or `-F - <<'EOF'` (or $'...') for real newlines; never embed "\\n".

## Project Structure & Module Organization
- Source code: `src/` (CLI wiring in `src/cli`, commands in `src/commands`, web provider in `src/provider-web.ts`, infra in `src/infra`, media pipeline in `src/media`).
- Tests: colocated `*.test.ts`.
- Docs: `docs/` (images, queue, Pi config). Built output lives in `dist/`.
- Plugins/extensions: live under `extensions/*` (workspace packages). Keep plugin-only deps in the extension `package.json`; do not add them to the root `package.json` unless core uses them.
- Plugins: install runs `npm install --omit=dev` in plugin dir; runtime deps must live in `dependencies`. Avoid `workspace:*` in `dependencies` (npm install breaks); put `clawdbot` in `devDependencies` or `peerDependencies` instead (runtime resolves `clawdbot/plugin-sdk` via jiti alias).
- Installers served from `https://clawd.bot/*`: live in the sibling repo `../clawd.bot` (`public/install.sh`, `public/install-cli.sh`, `public/install.ps1`).
- Messaging channels: always consider **all** built-in + extension channels when refactoring shared logic (routing, allowlists, pairing, command gating, onboarding, docs).
  - Core channel docs: `docs/channels/`
  - Core channel code: `src/telegram`, `src/discord`, `src/slack`, `src/signal`, `src/imessage`, `src/web` (WhatsApp web), `src/channels`, `src/routing`
  - Extensions (channel plugins): `extensions/*` (e.g. `extensions/msteams`, `extensions/matrix`, `extensions/zalo`, `extensions/zalouser`, `extensions/voice-call`)
- When adding channels/extensions/apps/docs, review `.github/labeler.yml` for label coverage.

## Docs Linking (Mintlify)
- Docs are hosted on Mintlify (docs.clawd.bot).
- Internal doc links in `docs/**/*.md`: root-relative, no `.md`/`.mdx` (example: `[Config](/configuration)`).
- Section cross-references: use anchors on root-relative paths (example: `[Hooks](/configuration#hooks)`).
- Doc headings and anchors: avoid em dashes and apostrophes in headings because they break Mintlify anchor links.
- When Peter asks for links, reply with full `https://docs.clawd.bot/...` URLs (not root-relative).
- When you touch docs, end the reply with the `https://docs.clawd.bot/...` URLs you referenced.
- README (GitHub): keep absolute docs URLs (`https://docs.clawd.bot/...`) so links work on GitHub.
- Docs content must be generic: no personal device names/hostnames/paths; use placeholders like `user@gateway-host` and “gateway host”.

## exe.dev VM ops (general)
- Access: stable path is `ssh exe.dev` then `ssh vm-name` (assume SSH key already set).
- SSH flaky: use exe.dev web terminal or Shelley (web agent); keep a tmux session for long ops.
- Update: `sudo npm i -g clawdbot@latest` (global install needs root on `/usr/lib/node_modules`).
- Config: use `clawdbot config set ...`; ensure `gateway.mode=local` is set.
- Discord: store raw token only (no `DISCORD_BOT_TOKEN=` prefix).
- Restart: stop old gateway and run:
  `pkill -9 -f clawdbot-gateway || true; nohup clawdbot gateway run --bind loopback --port 18789 --force > /tmp/clawdbot-gateway.log 2>&1 &`
- Verify: `clawdbot channels status --probe`, `ss -ltnp | rg 18789`, `tail -n 120 /tmp/clawdbot-gateway.log`.

## Build, Test, and Development Commands
- Runtime baseline: Node **22+** (keep Node + Bun paths working).
- Install deps: `pnpm install`
...
```

### Source: `clawdbot/CHANGELOG.md`
```markdown
# Changelog

Docs: https://docs.clawd.bot

## 2026.1.25
Status: unreleased.

### Changes
- Doctor: warn on gateway exposure without auth. (#2016) Thanks @Alex-Alaniz.
- Docs: add Vercel AI Gateway to providers sidebar. (#1901) Thanks @jerilynzheng.
- Agents: expand cron tool description with full schema docs. (#1988) Thanks @tomascupr.
- Skills: add missing dependency metadata for GitHub, Notion, Slack, Discord. (#1995) Thanks @jackheuberger.
- Docs: add Render deployment guide. (#1975) Thanks @anurag.
- CI: increase Node heap size for macOS checks. (#1890) Thanks @realZachi.

## 2026.1.24-3

### Fixes
- Gateway: harden reverse proxy handling for local-client detection and unauthenticated proxied connects. (#1795) Thanks @orlyjamie.
- Security audit: flag loopback Control UI with auth disabled as critical. (#1795) Thanks @orlyjamie.
- CLI: resume claude-cli sessions and stream CLI replies to TUI clients. (#1921) Thanks @rmorse.

## 2026.1.24-2

### Fixes
- Packaging: include dist/link-understanding output in npm tarball (fixes missing apply.js import on install).

## 2026.1.24-1

### Fixes
- Packaging: include dist/shared output in npm tarball (fixes missing reasoning-tags import on install).

## 2026.1.24

### Highlights
- Providers: Ollama discovery + docs; Venice guide upgrades + cross-links. (#1606) Thanks @abhaymundhara. https://docs.clawd.bot/providers/ollama https://docs.clawd.bot/providers/venice
- Channels: LINE plugin (Messaging API) with rich replies + quick replies. (#1630) Thanks @plum-dawg.
- TTS: Edge fallback (keyless) + `/tts` auto modes. (#1668, #1667) Thanks @steipete, @sebslight. https://docs.clawd.bot/tts
- Exec approvals: approve in-chat via `/approve` across all channels (including plugins). (#1621) Thanks @czekaj. https://docs.clawd.bot/tools/exec-approvals https://docs.clawd.bot/tools/slash-commands
- Telegram: DM topics as separate sessions + outbound link preview toggle. (#1597, #1700) Thanks @rohannagpal, @zerone0x. https://docs.clawd.bot/channels/telegram
...
```

### Source: `clawdbot/CLAUDE.md`
```markdown
# Repository Guidelines
- Repo: https://github.com/clawdbot/clawdbot
- GitHub issues/comments/PR comments: use literal multiline strings or `-F - <<'EOF'` (or $'...') for real newlines; never embed "\\n".

## Project Structure & Module Organization
- Source code: `src/` (CLI wiring in `src/cli`, commands in `src/commands`, web provider in `src/provider-web.ts`, infra in `src/infra`, media pipeline in `src/media`).
- Tests: colocated `*.test.ts`.
- Docs: `docs/` (images, queue, Pi config). Built output lives in `dist/`.
- Plugins/extensions: live under `extensions/*` (workspace packages). Keep plugin-only deps in the extension `package.json`; do not add them to the root `package.json` unless core uses them.
- Plugins: install runs `npm install --omit=dev` in plugin dir; runtime deps must live in `dependencies`. Avoid `workspace:*` in `dependencies` (npm install breaks); put `clawdbot` in `devDependencies` or `peerDependencies` instead (runtime resolves `clawdbot/plugin-sdk` via jiti alias).
- Installers served from `https://clawd.bot/*`: live in the sibling repo `../clawd.bot` (`public/install.sh`, `public/install-cli.sh`, `public/install.ps1`).
- Messaging channels: always consider **all** built-in + extension channels when refactoring shared logic (routing, allowlists, pairing, command gating, onboarding, docs).
  - Core channel docs: `docs/channels/`
  - Core channel code: `src/telegram`, `src/discord`, `src/slack`, `src/signal`, `src/imessage`, `src/web` (WhatsApp web), `src/channels`, `src/routing`
  - Extensions (channel plugins): `extensions/*` (e.g. `extensions/msteams`, `extensions/matrix`, `extensions/zalo`, `extensions/zalouser`, `extensions/voice-call`)
- When adding channels/extensions/apps/docs, review `.github/labeler.yml` for label coverage.

## Docs Linking (Mintlify)
- Docs are hosted on Mintlify (docs.clawd.bot).
- Internal doc links in `docs/**/*.md`: root-relative, no `.md`/`.mdx` (example: `[Config](/configuration)`).
- Section cross-references: use anchors on root-relative paths (example: `[Hooks](/configuration#hooks)`).
- Doc headings and anchors: avoid em dashes and apostrophes in headings because they break Mintlify anchor links.
- When Peter asks for links, reply with full `https://docs.clawd.bot/...` URLs (not root-relative).
- When you touch docs, end the reply with the `https://docs.clawd.bot/...` URLs you referenced.
- README (GitHub): keep absolute docs URLs (`https://docs.clawd.bot/...`) so links work on GitHub.
- Docs content must be generic: no personal device names/hostnames/paths; use placeholders like `user@gateway-host` and “gateway host”.

## exe.dev VM ops (general)
- Access: stable path is `ssh exe.dev` then `ssh vm-name` (assume SSH key already set).
- SSH flaky: use exe.dev web terminal or Shelley (web agent); keep a tmux session for long ops.
- Update: `sudo npm i -g clawdbot@latest` (global install needs root on `/usr/lib/node_modules`).
- Config: use `clawdbot config set ...`; ensure `gateway.mode=local` is set.
- Discord: store raw token only (no `DISCORD_BOT_TOKEN=` prefix).
- Restart: stop old gateway and run:
  `pkill -9 -f clawdbot-gateway || true; nohup clawdbot gateway run --bind loopback --port 18789 --force > /tmp/clawdbot-gateway.log 2>&1 &`
- Verify: `clawdbot channels status --probe`, `ss -ltnp | rg 18789`, `tail -n 120 /tmp/clawdbot-gateway.log`.

## Build, Test, and Development Commands
- Runtime baseline: Node **22+** (keep Node + Bun paths working).
- Install deps: `pnpm install`
...
```

*(Plus 334 other markdown files)*
