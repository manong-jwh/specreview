#!/usr/bin/env node
import { Command } from 'commander';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { init } from '../commands/init.js';
import { update } from '../commands/update.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf-8'));

const program = new Command();

program
  .name('specreview')
  .description('Multi-role code review skill for AI coding assistants')
  .version(pkg.version);

program
  .command('init [directory]')
  .description('Initialize specreview in your project')
  .option('--tools <tools>', 'Comma-separated tool IDs (claude,cursor,windsurf,...). Omit for interactive selection.')
  .option('--force', 'Overwrite existing files without prompting')
  .action(async (directory = '.', options) => {
    try {
      const projectPath = resolve(process.cwd(), directory);
      const tools = options.tools
        ? options.tools.split(',').map(t => t.trim().toLowerCase())
        : undefined;
      await init({ projectPath, tools, force: options.force ?? false });
    } catch (err) {
      console.error(`\n  Error: ${err.message}`);
      process.exit(1);
    }
  });

program
  .command('update [directory]')
  .description('Update specreview SKILL.md files (preserves your config)')
  .action(async (directory = '.') => {
    try {
      const projectPath = resolve(process.cwd(), directory);
      await update({ projectPath });
    } catch (err) {
      console.error(`\n  Error: ${err.message}`);
      process.exit(1);
    }
  });

program.parse();
