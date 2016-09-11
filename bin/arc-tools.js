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
  .version(packageJson.version)
  .description('The ARC developer tools')
  .command('clone <component> [otherComponents...]',
    'Clone or pull advanced-rest-client repositories into the current folder. If none of the ' +
    'components are cpecified then all components will be cloned / updated.')
  .command('catalog [command]', 'Run an ARC\'s catalog command')
  .parse(process.argv);
