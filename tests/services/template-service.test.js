import { describe, it, expect } from 'vitest';
import { TemplateService } from '../../services/template-service.js';

describe('TemplateService', () => {
  let svc;

  it('reads SKILL.md from the real templates directory', () => {
    svc = new TemplateService(); // defaults to ../templates
    const content = svc.getSkillContent();
    expect(content).toContain('specreview');
    expect(content).toContain('多角色代码审查');
  });

  it('reads config.yaml from the real templates directory', () => {
    svc = new TemplateService();
    const content = svc.getConfigYaml();
    expect(content).toContain('roles:');
    expect(content).toContain('code-check');
  });

  it('reads role-check files from the real templates directory', () => {
    svc = new TemplateService();
    const content = svc.getRoleCheckFile('code-check.md');
    expect(content).toContain('代码审查员');
    expect(content).toContain('可读性');
  });

  it('throws for missing templates', () => {
    svc = new TemplateService();
    expect(() => svc.read('does-not-exist.md')).toThrow('Template not found');
  });

  describe('renderRoleTable', () => {
    it('returns a markdown table with all roles', () => {
      svc = new TemplateService();
      const table = svc.renderRoleTable();

      // Header present
      expect(table).toContain('| 角色');

      // All 7 roles present
      expect(table).toContain('代码审查员');
      expect(table).toContain('逻辑审查员');
      expect(table).toContain('需求审查员');
      expect(table).toContain('性能审查员');
      expect(table).toContain('依赖审查员');
      expect(table).toContain('安全审查员');
      expect(table).toContain('测试审查员');

      // Sorted by priority: code-check (10) first, test-check (70) last
      const lines = table.split('\n').filter(l => l.startsWith('|'));
      const firstRole = lines[2]; // after header + separator
      const lastRole  = lines[lines.length - 1];
      expect(firstRole).toContain('代码审查员');
      expect(lastRole).toContain('测试审查员');
    });
  });
});
