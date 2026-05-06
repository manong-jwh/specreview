import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.js'],
    coverage: {
      provider: 'v8',
      include: [
        'bin/specreview.js',
        'commands/**/*.js',
        'services/**/*.js',
        'constants.js',
        'utils.js',
      ],
      exclude: ['tests/**'],
    },
  },
});
