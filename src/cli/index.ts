#!/usr/bin/env bun
import { Command } from 'commander';
import { authCommand } from './commands/auth.js';
import { runCommand } from './commands/run.js';
import { cleanerCommand } from './commands/cleaner.js';

const program = new Command();

program
  .name('feedguard')
  .description('View social media without entering social media. Take back control of your attention.')
  .version('0.1.0');

program
  .command('auth')
  .description('Authenticate with a social media platform')
  .argument('<platform>', 'Social media platform to login to')
  .action(authCommand);

program
  .command('run')
  .description('Run the feed scraper')
  .action(runCommand);

program
  .command('cleaner')
  .description('Clean massive HTML files for LLM context (reduces ~94%)')
  .argument('<html-file>', 'Path to HTML file to clean')
  .action(cleanerCommand);

program.parse();
