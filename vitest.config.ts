import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    setupFiles: ['test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: './coverage',
      all: true,
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts', 'src/**/types.ts', 'src/**/index.ts'],
      thresholds: {
        statements: 95,
        branches: 95,
        functions: 95,
        lines: 95
      },
    },
    restoreMocks: true,
    clearMocks: true,
  },
})
