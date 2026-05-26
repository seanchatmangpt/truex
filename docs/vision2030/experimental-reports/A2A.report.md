# Experimental Project Report: A2A

> **Status:** Analyzed as part of the Vision 2030 Global Audit
> **Path:** `/Users/sac/A2A`

## 1. Audit Status
- **Test Status:** ❌ Failing / Broken Build

## 2. Executable Entry Points
- `A2A/craftplan/Makefile`
- `A2A/craftplan/deploy.sh`
- `A2A/craftplan/generate-secrets.sh`
- `A2A/craftplan/nginx/generate-ssl.sh`
- `A2A/craftplan/scripts/build-a2a.sh`
- `A2A/craftplan/scripts/build-all.sh`
- `A2A/craftplan/scripts/build-mcp.sh`
- `A2A/craftplan/scripts/docker-build.sh`
- `A2A/craftplan/scripts/test-all.sh`
- `A2A/craftplan/test/run_tests.sh`
- `A2A/craftplan/test/verify_test_structure.sh`
- `A2A/elrmcp_bridge/Makefile`
- `A2A/erlang/a2a_erl/Makefile`
- `A2A/erlang/a2a_erl/bootstrap.sh`
- `A2A/erlang/a2a_erl/erlang.mk.setup.sh`
- `A2A/erlang/a2a_erl/test-dual-build.sh`
- `A2A/ggen/Makefile`
- `A2A/ggen/ontology/Makefile`
- `A2A/ggen/scripts/generate-templates.sh`
- `A2A/ggen/scripts/run_demo.sh`
- `A2A/ggen/scripts/run_scenario.sh`
- `A2A/ggen/test/generate_test_data.sh`
- `A2A/ggen/test/test_runner.sh`
- `A2A/scripts/build_docs.sh`
- `A2A/scripts/build_llms_full.sh`
- `A2A/scripts/build_sdk_docs.sh`
- `A2A/scripts/deploy_root_files.sh`
- `A2A/scripts/format.sh`
- `A2A/scripts/proto_to_json_schema.sh`
- `A2A/scripts/sort_spelling.sh`
- `A2A/third_party/googleapis/Makefile`

## 3. Extracted Documentation & Context
### Source: `A2A/CHANGELOG.md`
```markdown
# Changelog

## [0.4.0](https://github.com/a2aproject/A2A/compare/v0.3.0...v0.4.0) (2025-09-15)

### Features

* **spec:** Add `tasks/list` method for retrieving and filtering tasks with pagination

## [0.3.0](https://github.com/a2aproject/A2A/compare/v0.2.6...v0.3.0) (2025-07-30)


### ⚠ BREAKING CHANGES

* Add mTLS to SecuritySchemes, add oauth2 metadata url field, allow Skills to specify Security ([#901](https://github.com/a2aproject/A2A/issues/901))
* Change Well-Known URI for Agent Card hosting from `agent.json` to `agent-card.json` ([#841](https://github.com/a2aproject/A2A/issues/841))
* Add method for fetching extended card ([#929](https://github.com/a2aproject/A2A/issues/929))

### Features

* Add `signatures` to the `AgentCard` ([#917](https://github.com/a2aproject/A2A/issues/917)) ([ef4a305](https://github.com/a2aproject/A2A/commit/ef4a30505381e99b20103724cabef024389bacef))
* Add method for fetching extended card ([#929](https://github.com/a2aproject/A2A/issues/929)) ([2cd7d98](https://github.com/a2aproject/A2A/commit/2cd7d98bc8566601b9a18ca8afe92a0b4d203248))
* Add mTLS to SecuritySchemes, add oauth2 metadata url field, allow Skills to specify Security ([#901](https://github.com/a2aproject/A2A/issues/901)) ([e162c0c](https://github.com/a2aproject/A2A/commit/e162c0c6c4f609d2f4eef9042466d176ec75ebda))


### Bug Fixes

* **spec:** Add `SendMessageRequest.request` `json_name` mapping to `message` ([#904](https://github.com/a2aproject/A2A/issues/904)) ([2eef3f6](https://github.com/a2aproject/A2A/commit/2eef3f6113851e690cee70a1b1643e1ffd6d2a60))
* **spec:** Add Transport enum to specification ([#909](https://github.com/a2aproject/A2A/issues/909)) ([e834347](https://github.com/a2aproject/A2A/commit/e834347c279186d9d7873b352298e8b19737dd5a))


### Code Refactoring

* Change Well-Known URI for Agent Card hosting from `agent.json` to `agent-card.json` ([#841](https://github.com/a2aproject/A2A/issues/841)) ([0858ddb](https://github.com/a2aproject/A2A/commit/0858ddb884dc4671681fd819648dfd697176abb3))

## [0.2.6](https://github.com/a2aproject/A2A/compare/v0.2.5...v0.2.6) (2025-07-17)


### Bug Fixes

* Type fix and doc clarification ([#877](https://github.com/a2aproject/A2A/issues/877)) ([6f1d17b](https://github.com/a2aproject/A2A/commit/6f1d17ba806c32f2b6fbe465be93ec13bfe7d83c))
...
```

### Source: `A2A/CODE_OF_CONDUCT.md`
```markdown
# Code of Conduct

## Our Pledge

In the interest of fostering an open and welcoming environment, we as
contributors and maintainers pledge to making participation in our project and
our community a harassment-free experience for everyone, regardless of age, body
size, disability, ethnicity, gender identity and expression, level of
experience, education, socio-economic status, nationality, personal appearance,
race, religion, or sexual identity and orientation.

## Our Standards

Examples of behavior that contributes to creating a positive environment
include:

*   Using welcoming and inclusive language
*   Being respectful of differing viewpoints and experiences
*   Gracefully accepting constructive criticism
*   Focusing on what is best for the community
*   Showing empathy towards other community members

Examples of unacceptable behavior by participants include:

*   The use of sexualized language or imagery and unwelcome sexual attention or
    advances
*   Trolling, insulting/derogatory comments, and personal or political attacks
*   Public or private harassment
*   Publishing others' private information, such as a physical or electronic
    address, without explicit permission
*   Other conduct which could reasonably be considered inappropriate in a
    professional setting

## Our Responsibilities

Project maintainers are responsible for clarifying the standards of acceptable
behavior and are expected to take appropriate and fair corrective action in
response to any instances of unacceptable behavior.

Project maintainers have the right and responsibility to remove, edit, or reject
...
```

### Source: `A2A/CONTRIBUTING.md`
```markdown
# How to contribute

We'd love to accept your patches and contributions to this project.

## Contribution process

### Code reviews

All submissions, including submissions by project members, require review. We
use GitHub pull requests for this purpose. Consult
[GitHub Help](https://help.github.com/articles/about-pull-requests/) for more
information on using pull requests.

### Contributor Guide

You may follow these steps to contribute:

1. **Fork the official repository.** This will create a copy of the official repository in your own account.
2. **Sync the branches.** This will ensure that your copy of the repository is up-to-date with the latest changes from the official repository.
3. **Work on your forked repository's feature branch.** This is where you will make your changes to the code.
4. **Commit your updates on your forked repository's feature branch.** This will save your changes to your copy of the repository.
5. **Submit a pull request to the official repository's main branch.** This will request that your changes be merged into the official repository.
6. **Resolve any linting errors.** This will ensure that your changes are formatted correctly.

Here are some additional things to keep in mind during the process:

- **Test your changes.** Before you submit a pull request, make sure that your changes work as expected.
- **Be patient.** It may take some time for your pull request to be reviewed and merged.

...
```

*(Plus 92 other markdown files)*
