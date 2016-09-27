#!/usr/bin/env node

'use strict';

process.title = 'arc-stage';

const stage = require('../lib/arc-stage');
const program = require('commander');
const colors = require('colors/safe');

program
  .usage('[options] <component>')
  .option('--verbose', 'Display messages')
  .option('--working-dir <dir>', 'Make build on this directory.')
  .parse(process.argv);

var pkg = program.args;
if (pkg.length > 1 || pkg.length === 0) {
  console.log(colors.red('  Invalid number of components. Only one is allowed.'));
  program.outputHelp();
  process.exit(1);
}
var opts = {
  component: pkg[0],
  workingDir: program.workingDir || undefined,
  verbose: program.verbose || false
};

try {
  const script = new stage.ArcStage(opts);
  script.run().then(() => {
    process.exit(0);
  }).catch((err) => {
    console.log(colors.red('  ' + err.message));
    console.log(err);
    process.exit(1);
  });
} catch (e) {
  console.log(colors.red('  ' + e.message));
  program.outputHelp();
  process.exit(1);
}
