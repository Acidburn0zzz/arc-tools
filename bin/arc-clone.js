#!/usr/bin/env node

'use strict';

process.title = 'arc-clone';

const clone = require('../lib/arc-clone');
const program = require('commander');
const colors = require('colors/safe');

program
  .usage('[options] [components...]')
  .option('-S, --ssh', 'force ssh git path')
  .option('-A, --all', 'clone all repositories')
  .option('-n, --no-deps', 'do not download dependencies for the element')
  .option('-q, --quiet', 'Limit output (e.g. don\'t run spinner.)')
  .parse(process.argv);

var pkgs = program.args;
console.log();
if (!pkgs.length && !program.all) {
  console.log(colors.red('  No components specified. Use --all to clone all components.'));
  program.outputHelp();
  process.exit(1);
}
var opts = {
  ssh: program.ssh || false,
  all: program.all || false,
  noDeps: program.noDeps || false,
  quiet: program.quiet || false
};
if (!program.all) {
  opts.components = pkgs;
}
try {
  const script = new clone.ArcClone(opts);
  script.run();
} catch (e) {
  console.log(colors.red('  ' + e.message));
  program.outputHelp();
  process.exit(1);
}
