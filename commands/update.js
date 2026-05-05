import { existsSync, readFileSync, mkdirSync, writeFileSync, readdirSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import ora from 'ora';
import chalk from 'chalk';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = resolve(__dirname, '../templates');

const TOOLS = [
  { id: 'claude',         name: 'Claude Code',       dir: '.claude' },
  { id: 'cursor',         name: 'Cursor',             dir: '.cursor' },
  { id: 'windsurf',       name: 'Windsurf',           dir: '.windsurf' },
  { id: 'github-copilot', name: 'GitHub Copilot',     dir: '.github' },
  { id: 'cline',          name: 'Cline',               dir: '.cline' },
  { id: 'roocode',        name: 'RooCode',             dir: '.roo' },
  { id: 'codex',          name: 'Codex CLI',           dir: '.codex' },
  { id: 'warp',           name: 'Warp',                dir: '.warp' },
];

function readTemplate(name) {
  const p = join(TEMPLATES_DIR, name);
  if (!existsSync(p)) throw new Error(`Template not found: ${name}`);
  return readFileSync(p, 'utf-8');
}

function ensureDir(p) {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
}

export async function update({ projectPath }) {
  console.log(chalk.bold('\n  specreview update\n'));

  // 1. 检测已配置的工具
  const configured = TOOLS.filter(t => {
    const skillFile = join(projectPath, t.dir, 'skills', 'specreview', 'SKILL.md');
    return existsSync(skillFile);
  });

  if (configured.length === 0) {
    console.log('  No existing specreview configuration found. Run `specreview init` first.\n');
    return;
  }

  console.log(`  Found specreview in: ${configured.map(t => t.name).join(', ')}`);

  // 2. 更新 SKILL.md（覆盖）
  const skillSpinner = ora({ text: 'Updating skills...', color: 'gray' }).start();
  const skillContent = readTemplate('SKILL.md');
  let updated = 0;

  for (const tool of configured) {
    const skillFile = join(projectPath, tool.dir, 'skills', 'specreview', 'SKILL.md');
    ensureDir(dirname(skillFile));
    writeFileSync(skillFile, skillContent, 'utf-8');
    updated++;
  }

  skillSpinner.succeed(`Skills: ${updated} SKILL.md files updated`);

  // 3. 检查 config 目录是否存在，提醒用户手动合并
  const configDir = join(projectPath, 'specreview', 'config');
  const configYaml = join(configDir, 'config.yaml');

  if (existsSync(configYaml)) {
    console.log(`  ${chalk.dim('Config: specreview/config/ already exists (preserved).')}`);
    console.log(`  ${chalk.dim('  New role templates are available in the package.')}`);
    console.log(`  ${chalk.dim('  Compare: diff specreview/config/ <npm-prefix>/lib/node_modules/specreview/templates/config/')}`);
  } else {
    console.log(`  ${chalk.yellow('Config: specreview/config/ not found. Run `specreview init` to set up.')}`);
  }

  console.log();
  console.log(chalk.bold('  Update Complete'));
  console.log();
  console.log(`  ${chalk.green('✔')} Skills updated        ${chalk.dim('(overwritten with latest)')}`);
  console.log(`  ${chalk.dim('•')} Config preserved       ${chalk.dim('(your customizations kept)')}`);
  console.log();
  console.log(`  ${chalk.dim('Restart your AI assistant for updated skills to take effect.')}`);
  console.log();
}
