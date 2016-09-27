#!/usr/bin/env node

'use strict';

process.title = 'arc-stage';

const stage = require('../lib/arc-stage');
const program = require('commander');
const colors = require('colors/safe');

program
  .option('--verbose', 'Display messages')
  .option('--test', 'Perform a test')
  .parse(process.argv);

var opts = {
};

if (program.test) {
  process.env.TRAVIS_PULL_REQUEST = false;
  process.env.TRAVIS_BRANCH = 'stage';
  opts.test = true;
}

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
