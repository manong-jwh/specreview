import { describe, it, expect } from 'vitest';
import { TOOLS, CONFIG_FILES, CONFIG_YAML, ROLES } from '../constants.js';

describe('constants', () => {
  describe('TOOLS', () => {
    it('has entries with required properties', () => {
      for (const tool of TOOLS) {
        expect(tool).toHaveProperty('id');
        expect(tool).toHaveProperty('name');
        expect(tool).toHaveProperty('dir');
        expect(typeof tool.id).toBe('string');
        expect(tool.id.length).toBeGreaterThan(0);
      }
    });

    it('has unique IDs', () => {
      const ids = TOOLS.map((t) => t.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('has unique directory names', () => {
      const dirs = TOOLS.map((t) => t.dir);
      expect(new Set(dirs).size).toBe(dirs.length);
    });
  });

  describe('CONFIG_FILES', () => {
    it('contains 7 role-check files', () => {
      expect(CONFIG_FILES).toHaveLength(7);
    });

    it('all end with .md', () => {
      for (const f of CONFIG_FILES) {
        expect(f).toMatch(/\.md$/);
      }
    });
  });

  describe('CONFIG_YAML', () => {
    it('is config.yaml', () => {
      expect(CONFIG_YAML).toBe('config.yaml');
    });
  });

  describe('ROLES', () => {
    it('has 7 roles matching CONFIG_FILES', () => {
      expect(ROLES).toHaveLength(CONFIG_FILES.length);
    });

    it('each role has required properties', () => {
      for (const role of ROLES) {
        expect(role).toHaveProperty('id');
        expect(role).toHaveProperty('title');
        expect(role).toHaveProperty('priority');
        expect(role).toHaveProperty('description');
        expect(typeof role.priority).toBe('number');
      }
    });

    it('has unique priorities', () => {
      const priorities = ROLES.map((r) => r.priority);
      expect(new Set(priorities).size).toBe(priorities.length);
    });

    it('each role ID matches a CONFIG_FILES entry', () => {
      const fileNames = CONFIG_FILES.map((f) => f.replace('.md', ''));
      for (const role of ROLES) {
        expect(fileNames).toContain(role.id);
      }
    });
  });
});
