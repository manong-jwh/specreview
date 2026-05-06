import { describe, it, expect, beforeEach } from 'vitest';
import { ToolService } from '../../services/tool-service.js';

const MOCK_TOOLS = [
  { id: 'claude',         name: 'Claude Code',       dir: '.claude' },
  { id: 'cursor',         name: 'Cursor',             dir: '.cursor' },
  { id: 'github-copilot', name: 'GitHub Copilot',     dir: '.github' },
];

/**
 * Stub FileService for testing ToolService in isolation.
 */
function stubFs(presentDirs = []) {
  return {
    exists(relPath) {
      return presentDirs.some(d => relPath === d || relPath.endsWith('/' + d));
    },
  };
}

describe('ToolService', () => {
  describe('getAll', () => {
    it('returns all tool definitions', () => {
      const svc = new ToolService(MOCK_TOOLS, stubFs());
      expect(svc.getAll()).toHaveLength(3);
      expect(svc.getAll()).toEqual(MOCK_TOOLS);
    });

    it('returns a copy (not the original array)', () => {
      const svc = new ToolService(MOCK_TOOLS, stubFs());
      expect(svc.getAll()).not.toBe(MOCK_TOOLS);
    });
  });

  describe('detect', () => {
    it('returns IDs of tools whose directories exist', () => {
      const svc = new ToolService(MOCK_TOOLS, stubFs(['.claude', '.cursor']));
      expect(svc.detect()).toEqual(['claude', 'cursor']);
    });

    it('returns empty array when no directories exist', () => {
      const svc = new ToolService(MOCK_TOOLS, stubFs([]));
      expect(svc.detect()).toEqual([]);
    });

    it('respects the prefix option', () => {
      const svc = new ToolService(MOCK_TOOLS, stubFs(['sub/.claude']));
      expect(svc.detect('sub')).toEqual(['claude']);
    });
  });

  describe('filterByIds', () => {
    it('returns only matching tools', () => {
      const svc = new ToolService(MOCK_TOOLS, stubFs());
      const result = svc.filterByIds(['claude', 'github-copilot']);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('claude');
      expect(result[1].id).toBe('github-copilot');
    });

    it('returns empty array for no matches', () => {
      const svc = new ToolService(MOCK_TOOLS, stubFs());
      expect(svc.filterByIds(['nonexistent'])).toEqual([]);
    });
  });

  describe('findById', () => {
    it('finds a tool by ID', () => {
      const svc = new ToolService(MOCK_TOOLS, stubFs());
      expect(svc.findById('cursor')?.name).toBe('Cursor');
    });

    it('returns undefined for unknown ID', () => {
      const svc = new ToolService(MOCK_TOOLS, stubFs());
      expect(svc.findById('unknown')).toBeUndefined();
    });
  });

  describe('resolveSelection', () => {
    it('uses explicit tools when provided', () => {
      const svc = new ToolService(MOCK_TOOLS, stubFs([]));
      const result = svc.resolveSelection({ tools: ['claude'] });
      expect(result.selected).toHaveLength(1);
      expect(result.selected[0].id).toBe('claude');
      expect(result.isExplicit).toBe(true);
    });

    it('falls back to detected tools when no explicit tools given', () => {
      const svc = new ToolService(MOCK_TOOLS, stubFs(['.claude']));
      const result = svc.resolveSelection();
      expect(result.detected).toEqual(['claude']);
      expect(result.isExplicit).toBe(false);
    });
  });
});
