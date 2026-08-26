import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

export default defineConfig({
  resolve: {
    alias: {
      '@truex/membrane': resolve(__dirname, 'packages/membrane/src/index.ts'),
    },
  },
  test: {
    include: [
      'test/**/*.test.{js,ts}',
      'packages/membrane/test/**/*.test.{js,ts}',
      'packages/storehouse/test/**/*.test.{js,ts}',
      '.generated/doctests/**/*.test.ts',
      'examples/**/*.test.ts'
    ],
    fileParallelism: false,
    testTimeout: 60_000,
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
