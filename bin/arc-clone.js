#!/usr/bin/env node

'use strict';

process.title = 'arc-clone';

const clone = require('../lib/arc-clone');
const program = require('commander');
const colors = require('colors/safe');

program
  .usage('[options] [components...]')
  .option('-S, --no-ssh', 'force http git path instead of ssh')
  .option('-A, --all', 'clone all repositories')
  .option('-n, --no-deps', 'do not download dependencies for the element')
  .option('-T --token', 'GitHub token which is required to list repositories. Set the ' +
    'GITHUB_TOKEN variable to skip token passing.')
  .option('--verbose', 'Display messages')
  .parse(process.argv);

var pkgs = program.args;
if (!pkgs.length && !program.all) {
  console.log();
  console.log(colors.red('  No components specified. Use --all to clone all components.'));
  program.outputHelp();
  process.exit(1);
}

var opts = {
  noSsh: !program.ssh,
  noDeps: !program.deps,
  all: program.all || false,
  verbose: program.verbose || false
};
if (!program.all) {
  opts.components = pkgs;
}
try {
  const script = new clone.ArcClone(opts);
  script.run()
  .then(() => console.log('Cloned with great success'))
  .catch((err) => console.error(err));
} catch (e) {
  console.log(colors.red('  ' + e.message));
  program.outputHelp();
  process.exit(1);
}
