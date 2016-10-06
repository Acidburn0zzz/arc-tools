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
  .command('release <target>',
    'Builds the app for given <release>, update git repository and publish the app in ' +
    'the Chrome Web Store')
  .command('clone <component> [otherComponents...]',
    'Clones or pulls advanced-rest-client\'s repositories into the current folder')
  // .command('catalog [command]', 'Runs an ARC\'s catalog command')
  .command('docs <component> [otherComponents...]',
    'Generates docs for given components')
  .command('structure [component] [otherComponents...]',
    'Updates structure database for the elements catalog')
  .command('bump <version>',
    'Bumps version of current element')
  .command('changelog',
    'Generates changelog for current element')
  .command('repo <command>',
    'Performs an operation on ARC GitHub\'s repository')
  .command('stage <component>',
    'CI command. Builds element from stage branch')
  .command('master-release',
    'CI command. Releases element from master branch')
  .parse(process.argv);
