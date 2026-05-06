// ---------------------------------------------------------------------------
// TemplateService — reads and (optionally) renders templates
// ---------------------------------------------------------------------------

import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, existsSync } from 'fs';
import { ROLES } from '../constants.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_TEMPLATES_DIR = resolve(__dirname, '..', 'templates');

/**
 * Manages access to specreview's built-in template files.
 */
export class TemplateService {
  readonly templatesDir: string;

  constructor(templatesDir = DEFAULT_TEMPLATES_DIR) {
    this.templatesDir = resolve(templatesDir);
  }

  read(...segments: string[]): string {
    const fullPath = join(this.templatesDir, ...segments);
    try {
      return fsReadSync(fullPath);
    } catch {
      throw new Error(`Template not found: ${segments.join('/')}`);
    }
  }

  getSkillContent(): string {
    return this.read('SKILL.md');
  }

  getConfigYaml(): string {
    return this.read('config', 'config.yaml');
  }

  getRoleCheckFile(name: string): string {
    return this.read('config', name);
  }

  renderRoleTable(): string {
    const sorted = [...ROLES].sort((a, b) => a.priority - b.priority);

    const header = `| ${'角色'.padEnd(16)} | ${'文件'.padEnd(32)} | ${'优先级'.padEnd(8)} | ${'关注领域'.padEnd(30)} |`;
    const sep = `|${''.padEnd(18, '-')}|${''.padEnd(34, '-')}|${''.padEnd(10, '-')}|${''.padEnd(32, '-')}|`;
    const rows = sorted.map(
      (r) =>
        `| ${r.title.padEnd(16)} | ${`specreview/config/${r.id}.md`.padEnd(32)} | ${String(r.priority).padEnd(8)} | ${r.description.padEnd(30)} |`,
    );

    return [header, sep, ...rows].join('\n');
  }
}

// ---------------------------------------------------------------------------
// Inline fs helper
// ---------------------------------------------------------------------------

function fsReadSync(p: string): string {
  if (!existsSync(p)) {
    throw new Error('not found');
  }
  return readFileSync(p, 'utf-8');
}
