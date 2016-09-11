#!/usr/bin/env node

'use strict';

process.title = 'arc-tools';

const program = require('commander');
const updateNotifier = require('update-notifier');
const packageJson = require('../package.json');
// const lib = require('../main.js');

// See https://github.com/yeoman/update-notifier#how for how this works.
updateNotifier({pkg: packageJson}).notify();

program
  .version('0.0.1')
  .command('clone', 'Clone all advanced-rest-client repositories into current folder.')
  .command('catalog [command]', 'Run an ARC\'s catalog command')
  .parse(process.argv);
