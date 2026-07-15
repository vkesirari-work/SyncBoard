import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  esbuild: { jsx: 'automatic' },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    css: false,
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/test/**', '**/*.spec.{js,jsx}'],
      thresholds: {
        statements: 80,
        lines: 80,
      },
    },
  },
})
