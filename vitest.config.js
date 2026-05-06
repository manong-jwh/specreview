import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['bin/specreview.ts', 'commands/**/*.ts', 'services/**/*.ts', 'constants.ts', 'utils.ts'],
      exclude: ['tests/**'],
    },
  },
});
