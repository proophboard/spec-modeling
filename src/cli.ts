#!/usr/bin/env node

import degit from 'degit';
import path from 'path';
import fs from 'fs';

const REPO = 'proophboard/spec-modeling';

const [,, command, targetArg] = process.argv;

function printUsage() {
  console.log(`
Usage: spec-modeling <command> [target-dir]

Commands:
  init [dir]   Scaffold a new spec-modeling project into [dir] (default: current directory)
`);
}

async function init(targetDir: string) {
  const absTarget = path.resolve(targetDir);

  console.log(`\nInitializing spec-modeling in: ${absTarget}\n`);

  // Warn if the target directory already has content
  if (fs.existsSync(absTarget) && fs.readdirSync(absTarget).length > 0) {
    console.warn(`⚠  Directory is not empty. Existing files may be overwritten.\n`);
  }

  const emitter = degit(REPO, {
    cache: false,
    force: true,
    verbose: false,
  });

  emitter.on('info', (info: { message: string }) => {
    console.log(`  ${info.message}`);
  });

  try {
    await emitter.clone(absTarget);
    console.log('✓ Files copied from GitHub (no git history)\n');
    console.log('Next steps:');
    console.log(`  cd ${path.relative(process.cwd(), absTarget) || '.'}`);
    console.log('  npm install');
    console.log('  # Configure .env (see .env.example)');
    console.log('  # Start editing skills/ and model/ as needed\n');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`✗ Failed to initialize: ${message}`);
    process.exit(1);
  }
}

switch (command) {
  case 'init':
    await init(targetArg || '.');
    break;
  default:
    printUsage();
    if (command) {
      console.error(`Unknown command: ${command}\n`);
      process.exit(1);
    }
}
