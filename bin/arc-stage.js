#!/usr/bin/env node

'use strict';

process.title = 'arc-stage';

const stage = require('../lib/arc-stage');
const program = require('commander');
const colors = require('colors/safe');

program
  .option('-F, --force', 'Force commit even if it is not a pull request')
  .option('--verbose', 'Display messages')
  .parse(process.argv);

var opts = {
  force: program.force || false
};

try {
  const script = new stage.ArcStage(opts);
  script.run().then(() => {
    process.exit(0);
  }).catch((err) => {
    console.log(colors.red('  ' + err.message));
    process.exit(1);
  });
} catch (e) {
  console.log(colors.red('  ' + e.message));
  program.outputHelp();
  process.exit(1);
}
