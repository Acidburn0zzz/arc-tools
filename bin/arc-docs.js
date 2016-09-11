#!/usr/bin/env node

'use strict';

process.title = 'arc-docs';

const program = require('commander');
const colors = require('colors/safe');
const docs = require('../lib/arc-docs');

program
  .usage('[options] [components...]')
  .option('-A, --all', 'Generate docs for all components')
  .option('--verbose', 'Display messages')
  .parse(process.argv);

var pkgs = program.args;
console.log();
if (!pkgs.length && !program.all) {
  console.log(colors.red('  No components specified. Use --all to process all components.'));
  program.outputHelp();
  process.exit(1);
}
var opts = {
  all: program.all || false,
  verbose: program.verbose || false
};
if (!program.all) {
  opts.components = pkgs;
}
try {
  const script = new docs.ArcDocs(opts);
  script.run();
} catch (e) {
  console.log(colors.red('  ' + e.message));
  console.log(e.stack);
  program.outputHelp();
  process.exit(1);
}
