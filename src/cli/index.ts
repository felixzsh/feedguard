#!/usr/bin/env bun

import { Command } from 'commander';
import { authCommand } from './commands/auth.js';

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

program.parse();
