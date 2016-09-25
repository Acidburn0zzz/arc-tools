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
    'Clone or pull advanced-rest-client repositories into the current folder.')
  .command('catalog [command]', 'Run an ARC\'s catalog command')
  .command('docs <component> [otherComponents...]', 'Generate docs for given components')
  .command('release <target>',
    'Build the app for give <release>, update git repository and publish the app in the store.')
  .command('structure [component] [otherComponents...]',
    'Update structure database for the elements catalog.')
  .parse(process.argv);
