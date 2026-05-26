# Experimental Project Report: ai

> **Status:** Analyzed as part of the Vision 2030 Global Audit
> **Path:** `/Users/sac/ai`

## 1. Audit Status
- **Test Status:** ❌ Failing / Broken Build

## 2. Executable Entry Points
- `ai/package.json`
- `ai/packages/ai/package.json`
- `ai/packages/amazon-bedrock/package.json`
- `ai/packages/angular/package.json`
- `ai/packages/anthropic/package.json`
- `ai/packages/assemblyai/package.json`
- `ai/packages/azure/package.json`
- `ai/packages/baseten/package.json`
- `ai/packages/cerebras/package.json`
- `ai/packages/codemod/package.json`
- `ai/packages/cohere/package.json`
- `ai/packages/deepgram/package.json`
- `ai/packages/deepinfra/package.json`
- `ai/packages/deepseek/package.json`
- `ai/packages/elevenlabs/package.json`
- `ai/packages/fal/package.json`
- `ai/packages/fireworks/package.json`
- `ai/packages/gateway/package.json`
- `ai/packages/gladia/package.json`
- `ai/packages/google/package.json`
- `ai/packages/google-vertex/package.json`
- `ai/packages/groq/package.json`
- `ai/packages/huggingface/package.json`
- `ai/packages/hume/package.json`
- `ai/packages/langchain/package.json`
- `ai/packages/llamaindex/package.json`
- `ai/packages/lmnt/package.json`
- `ai/packages/luma/package.json`
- `ai/packages/mistral/package.json`
- `ai/packages/openai/package.json`
- `ai/packages/openai-compatible/package.json`
- `ai/packages/perplexity/package.json`
- `ai/packages/provider/package.json`
- `ai/packages/provider-utils/package.json`
- `ai/packages/react/package.json`
- `ai/packages/replicate/package.json`
- `ai/packages/revai/package.json`
- `ai/packages/rsc/package.json`
- `ai/packages/svelte/package.json`
- `ai/packages/test-server/package.json`
- `ai/packages/togetherai/package.json`
- `ai/packages/valibot/package.json`
- `ai/packages/vercel/package.json`
- `ai/packages/vue/package.json`
- `ai/packages/xai/package.json`
- `ai/tools/analyze-downloads/package.json`
- `ai/tools/eslint-config/package.json`
- `ai/tools/generate-llms-txt/package.json`
- `ai/tools/tsconfig/package.json`

## 3. Extracted Documentation & Context
### Source: `ai/CHANGELOG.md`
```markdown
You can find the changelogs for the individual packages in their respective `CHANGELOG.md` files:

### Main AI SDK package

- [ai](./packages/ai/CHANGELOG.md)

### Providers

- [@ai-sdk/amazon-bedrock](./packages/amazon-bedrock/CHANGELOG.md)
- [@ai-sdk/anthropic](./packages/anthropic/CHANGELOG.md)
- [@ai-sdk/azure](./packages/azure/CHANGELOG.md)
- [@ai-sdk/cerebras](./packages/cerebras/CHANGELOG.md)
- [@ai-sdk/cohere](./packages/cohere/CHANGELOG.md)
- [@ai-sdk/deepinfra](./packages/deepinfra/CHANGELOG.md)
- [@ai-sdk/deepseek](./packages/deepseek/CHANGELOG.md)
- [@ai-sdk/fal](./packages/fal/CHANGELOG.md)
- [@ai-sdk/fireworks](./packages/fireworks/CHANGELOG.md)
- [@ai-sdk/gateway](./packages/gateway/CHANGELOG.md)
- [@ai-sdk/google](./packages/google/CHANGELOG.md)
- [@ai-sdk/google-vertex](./packages/google-vertex/CHANGELOG.md)
- [@ai-sdk/groq](./packages/groq/CHANGELOG.md)
- [@ai-sdk/luma](./packages/luma/CHANGELOG.md)
- [@ai-sdk/mistral](./packages/mistral/CHANGELOG.md)
- [@ai-sdk/openai](./packages/openai/CHANGELOG.md)
- [@ai-sdk/openai-compatible](./packages/openai-compatible/CHANGELOG.md)
- [@ai-sdk/perplexity](./packages/perplexity/CHANGELOG.md)
- [@ai-sdk/togetherai](./packages/togetherai/CHANGELOG.md)
- [@ai-sdk/vercel](./packages/vercel/CHANGELOG.md)
- [@ai-sdk/xai](./packages/xai/CHANGELOG.md)

### UI integrations

- [@ai-sdk/react](./packages/react/CHANGELOG.md)
- [@ai-sdk/solid](./packages/solid/CHANGELOG.md)
- [@ai-sdk/svelte](./packages/svelte/CHANGELOG.md)
- [@ai-sdk/vue](./packages/vue/CHANGELOG.md)

### Other

- [@ai-sdk/codemod](./packages/codemod/CHANGELOG.md)
...
```

### Source: `ai/CODE_OF_CONDUCT.md`
```markdown
# Vercel Community Code of Conduct

Please see https://community.vercel.com/guidelines for the latest version.

...
```

### Source: `ai/CONTRIBUTING.md`
```markdown
# Contributing to the AI SDK

We deeply appreciate your interest in contributing to our repository! Whether you're reporting bugs, suggesting enhancements, improving docs, or submitting pull requests, your contributions help improve the project for everyone.

## Reporting Bugs

If you've encountered a bug in the project, we encourage you to report it to us. Please follow these steps:

1. **Check the Issue Tracker**: Before submitting a new bug report, please check our issue tracker to see if the bug has already been reported. If it has, you can add to the existing report.
2. **Create a New Issue**: If the bug hasn't been reported, create a new issue. Provide a clear title and a detailed description of the bug. Include any relevant logs, error messages, and steps to reproduce the issue.
3. **Label Your Issue**: If possible, label your issue as a `bug` so it's easier for maintainers to identify.

## Suggesting Enhancements

We're always looking for suggestions to make our project better. If you have an idea for an enhancement, please:

1. **Check the Issue Tracker**: Similar to bug reports, please check if someone else has already suggested the enhancement. If so, feel free to add your thoughts to the existing issue.
2. **Create a New Issue**: If your enhancement hasn't been suggested yet, create a new issue. Provide a detailed description of your suggested enhancement and how it would benefit the project.

## Improving Documentation

Documentation is crucial for understanding and using our project effectively.
You can find the content of our docs under [`content`](https://github.com/vercel/ai/tree/main/content).

To fix smaller typos, you can edit the code directly in GitHub or use Github.dev (press `.` in Github).

If you want to make larger changes, please check out the Code Contributions section below. It also explains how to fix prettier issues that you might encounter during your docs changes.

## Code Contributions

We welcome your contributions to our code and documentation. Here's how you can contribute:

### Environment Setup

AI SDK development requires PNPM v9 (lockfile version) or higher and Node v22.

### Setting Up the Repository Locally

To set up the repository on your local machine, follow these steps:

...
```

*(Plus 97 other markdown files)*
