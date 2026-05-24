import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['test/**/*.test.{js,ts}', 'packages/truex-core/test/**/*.test.{js,ts}', '.generated/doctests/**/*.test.ts', 'examples/**/*.test.ts'],
    fileParallelism: false,
    testTimeout: 60000,
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      }
    }
  }
})
