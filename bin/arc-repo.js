#!/usr/bin/env node

'use strict';

process.title = 'arc-repo';

const repo = require('../lib/arc-repo');
const program = require('commander');
const colors = require('colors/safe');

const allowedCommands = ['create'];

const action = (command, repoName) => {
  if (allowedCommands.indexOf(command) === -1) {
    console.log();
    console.log(colors.red(`  Error: command ${command} is unknown.`));
    console.log();
    process.exit(1);
  }
  if (repoName && !/^[a-zA-Z0-9_-]*$/.test(repoName)) {
    console.log();
    console.log(colors.red(`  Error: name ${repoName} is invalid.`));
    console.log();
    process.exit(1);
  }
  try {
    program.repoName = repoName;
    const script = new repo.ArcRepo(command, program);
    script.run().then(() => {
      process.exit(0);
    }).catch((err) => {
      console.log(colors.red('  ' + err.message));
      process.exit(1);
    });
  } catch (e) {
    console.log(e);
    console.log(colors.red('  ' + e.message));
    program.outputHelp();
    process.exit(1);
  }
};

program
  .arguments('<command> [repo-name]')
  .option('--token', 'Github access token. Set GITHUB_TOKEN variable to omnit it.')
  .option('--verbose', 'Print output to console.')
  .action(action);
program.on('--help', function() {
  console.log('  Commands:');
  console.log('');
  console.log('    create   Creates a repository in ARC\'s ogranization with default ' +
    'configuration.');
  console.log('    create --description, -D  Description of the repository ');
  console.log('');
  console.log('  Examples:');
  console.log('');
  console.log('    $ arc repo create repo-name');
  console.log('');
});
program.parse(process.argv);
