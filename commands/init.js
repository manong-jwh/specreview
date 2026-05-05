import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import ora from 'ora';
import chalk from 'chalk';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = resolve(__dirname, '../templates');

// ---------------------------------------------------------------------------
// Tool definitions — like OpenSpec's AI_TOOLS
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Config + role files list
// ---------------------------------------------------------------------------
const CONFIG_FILES = [
  'config.yaml',
  'code-check.md',
  'logic-check.md',
  'spec-check.md',
  'perf-check.md',
  'dep-check.md',
  'security-check.md',
  'test-check.md',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readTemplate(name) {
  const p = join(TEMPLATES_DIR, name);
  if (!existsSync(p)) throw new Error(`Template not found: ${name}`);
  return readFileSync(p, 'utf-8');
}

function ensureDir(p) {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
}

function writeFile(p, content) {
  ensureDir(dirname(p));
  writeFileSync(p, content, 'utf-8');
}

// ---------------------------------------------------------------------------
// Tool detection — scan project for existing AI tool directories
// ---------------------------------------------------------------------------

function detectTools(projectPath) {
  const detected = [];
  for (const tool of TOOLS) {
    if (existsSync(join(projectPath, tool.dir))) {
      detected.push(tool.id);
    }
  }
  return detected;
}

// ---------------------------------------------------------------------------
// Init command
// ---------------------------------------------------------------------------

export async function init({ projectPath, tools, force }) {
  console.log(chalk.bold('\n  specreview init\n'));

  // Step 1: Detect available tools
  const detected = detectTools(projectPath);
  if (detected.length > 0) {
    console.log(`  Detected: ${detected.map(id => TOOLS.find(t => t.id === id)?.name || id).join(', ')}`);
  }

  // Step 2: Resolve tool selection
  let selectedTools;

  if (tools) {
    // Non-interactive mode
    selectedTools = TOOLS.filter(t => tools.includes(t.id));
    if (selectedTools.length === 0) {
      console.log(`  No supported tools in: ${tools.join(', ')}`);
      console.log(`  Available: ${TOOLS.map(t => t.id).join(', ')}\n`);
      return;
    }
  } else {
    // Interactive mode — like OpenSpec's searchable multi-select
    let { checkbox } = await import('@inquirer/prompts');

    const choices = TOOLS.map(tool => ({
      name: `${tool.name.padEnd(20)} (.${tool.dir}/)`,
      value: tool.id,
      checked: detected.includes(tool.id),
    }));

    // Add Select All / None helpers
    choices.unshift(
      { name: chalk.dim('───'), value: '__sep1', disabled: true },
    );

    const selected = await checkbox({
      message: 'Select AI tools to set up:',
      choices,
      pageSize: 12,
      validate: (val) => val.length > 0 || 'Select at least one tool',
      loop: false,
    });

    selectedTools = TOOLS.filter(t => selected.includes(t.id));
  }

  if (selectedTools.length === 0) {
    console.log('  No tools selected. Nothing to do.\n');
    return;
  }

  // Step 3: Check existing config
  const configDir = join(projectPath, 'specreview', 'config');
  const configYaml = join(configDir, 'config.yaml');
  const configExists = existsSync(configYaml);

  // Step 4: Generate SKILL.md for each tool
  console.log();
  const skillSpinner = ora({ text: 'Generating skills...', color: 'gray' }).start();
  const skillContent = readTemplate('SKILL.md');
  let createdCount = 0;
  let skippedCount = 0;

  for (const tool of selectedTools) {
    const skillFile = join(projectPath, tool.dir, 'skills', 'specreview', 'SKILL.md');

    if (existsSync(skillFile) && !force) {
      skippedCount++;
    } else {
      ensureDir(dirname(skillFile));
      writeFile(skillFile, skillContent);
      createdCount++;
    }
  }

  skillSpinner.succeed(
    `Skills: ${createdCount} created, ${skippedCount} skipped (${selectedTools.length} tools)`
  );

  // Step 5: Generate config + role files
  const configSpinner = ora({ text: 'Generating config...', color: 'gray' }).start();

  if (configExists && !force) {
    configSpinner.info(`Config: specreview/config/ already exists (use --force to overwrite)`);
  } else {
    ensureDir(configDir);
    for (const file of CONFIG_FILES) {
      const content = readTemplate(join('config', file));
      writeFile(join(configDir, file), content);
    }
    configSpinner.succeed(`Config: specreview/config/ (${CONFIG_FILES.length} files)`);
  }

  // Step 6: Success message — like OpenSpec style
  console.log();
  console.log(chalk.bold('  Setup Complete'));
  console.log();

  for (const tool of selectedTools) {
    const skillFile = join(projectPath, tool.dir, 'skills', 'specreview', 'SKILL.md');
    const relPath = `.${tool.dir}/skills/specreview/SKILL.md`;
    console.log(`  ${chalk.green('✔')} ${tool.name.padEnd(16)} ${chalk.dim(relPath)}`);
  }
  console.log(`  ${chalk.green('✔')} Config              ${chalk.dim('specreview/config/')}`);

  console.log();
  console.log(`  ${chalk.bold('Getting started:')}`);
  console.log(`    /specreview <spec-name>     Run a multi-role review`);
  console.log(`    /specreview change-table    Review the "change-table" spec`);
  console.log();
  console.log(`  ${chalk.dim('Restart your AI assistant for the slash command to take effect.')}`);
  console.log();
}
