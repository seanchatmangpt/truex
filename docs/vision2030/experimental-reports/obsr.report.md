# Experimental Project Report: obsr

> **Status:** Analyzed as part of the Vision 2030 Global Audit
> **Path:** `/Users/sac/obsr`

## 1. Audit Status
- **Test Status:** ⚠️ No Tests Found / Not Executable

## 2. Executable Entry Points
- *No standard executable entry points found (depth <= 2)*

## 3. Extracted Documentation & Context
### Source: `obsr/CHANGELOG.md`
```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.11] - 2026-01-14

### Fixed
- **WebSocket**: Fixed `ManualUpgrade` error by properly draining request body before upgrade in `rustapi-ws`.
- **WebSocket**: Enabled `http1::Builder::with_upgrades()` in `rustapi-core` server for Hyper 1.0 compatibility.
- **Examples**: Fixed compilation issues in `phase11-demo` and `graphql-api`.
- **Examples**: Updated `websocket` example with better debug logging.

## [0.1.10] - 2026-01-14

### Documentation
- Updated READMEs for all crates with comprehensive examples and better structure.
- Improved `Cargo.toml` descriptions and documentation links.

## [0.1.9] - 2026-01-14

### Added

#### Performance (big-performance branch)
- **`simd-json` feature**: 2-4x faster JSON parsing when enabled
- **Stack-optimized `PathParams`**: Using `SmallVec<[_; 4]>` for fewer allocations
- **Conditional tracing**: Logging gated behind `tracing` feature for 10-20% less overhead
- **Streaming request body**: Support for large/unbuffered bodies without full memory buffering

#### New Crates
- **`rustapi-jobs`**: Background job processing
  - In-memory, Redis, and Postgres backends
  - Job queue with retry logic and exponential backoff
  - Dead letter queue for failed jobs
  - Scheduled and delayed execution
- **`rustapi-testing`**: Test utilities
...
```

### Source: `obsr/CODE_OF_CONDUCT.md`
```markdown
# Contributor Covenant Code of Conduct

## Our Pledge

We as members, contributors, and leaders pledge to make participation in our community a harassment-free experience for everyone, regardless of age, body size, visible or invisible disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, caste, color, religion, or sexual identity and orientation.

We pledge to act and interact in ways that contribute to an open, welcoming, diverse, inclusive, and healthy community.

## Our Standards

Examples of behavior that contributes to a positive environment for our community include:

* Demonstrating empathy and kindness toward other people
* Being respectful of differing opinions, viewpoints, and experiences
* Giving and gracefully accepting constructive feedback
* Accepting responsibility and apologizing to those affected by our mistakes, and learning from the experience
* Focusing on what is best not just for us as individuals, but for the overall community

Examples of unacceptable behavior include:

* The use of sexualized language or imagery, and sexual attention or advances of any kind
* Trolling, insulting or derogatory comments, and personal or political attacks
* Public or private harassment
* Publishing others' private information, such as a physical or email address, without their explicit permission
* Other conduct which could reasonably be considered inappropriate in a professional setting

## Enforcement Responsibilities

Community leaders are responsible for clarifying and enforcing our standards of acceptable behavior and will take appropriate and fair corrective action in response to any behavior that they deem inappropriate, threatening, offensive, or harmful.

Community leaders have the right and responsibility to remove, edit, or reject comments, commits, code, wiki edits, issues, and other contributions that are not aligned to this Code of Conduct, and will communicate reasons for moderation decisions when appropriate.

## Scope

This Code of Conduct applies within all community spaces, and also applies when an individual is officially representing the community in public spaces. Examples of representing our community include using an official email address, posting via an official social media account, or acting as an appointed representative at an online or offline event.

## Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported to the community leaders responsible for enforcement at tunayengin21@hotmail.com. All complaints will be reviewed and investigated promptly and fairly.

...
```

### Source: `obsr/CONTRIBUTING.md`
```markdown
# Contributing to RustAPI

Thank you for your interest in contributing to RustAPI! We welcome contributions of all kinds - bug reports, feature requests, documentation improvements, and code contributions.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Code Style](#code-style)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)
- [Release Process](#release-process)
- [Getting Help](#getting-help)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## Governance & Merge Policy

To maintain repository stability and code quality, we enforce the following policies:

1.  **Branch Protection**: The `main` branch is protected. Direct pushes are disabled.
2.  **Pull Requests**: All changes must be submitted via Pull Request.
3.  **Linear History**: We use **Squash Merges** to keep the history clean and linear. Merge commits are disabled.
4.  **Force Pushes**: Force pushes to `main` are strictly prohibited.

## Getting Started

### First Time Contributors

New to open source? Check out these resources:
- [How to Contribute to Open Source](https://opensource.guide/how-to-contribute/)
- [First Contributions](https://github.com/firstcontributions/first-contributions)

### Quick Start

...
```

*(Plus 13 other markdown files)*
