import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    root: new URL('.', import.meta.url).pathname,
    include: ['./tests/**/*.test.mjs'],
    coverage: {
      reporter: ['text', 'html'],
      reportsDirectory: './coverage',
    },
  },
});
