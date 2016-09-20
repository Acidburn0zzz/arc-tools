#!/usr/bin/env node

'use strict';

process.title = 'arc-release';

const program = require('commander');
const colors = require('colors/safe');
const release = require('../lib/arc-release');

var desc = 'Build the app for given <target>, update git repository and publish the app ' +
  'in the store. The <target> argument must be one of the:\n  *stable\n  *beta\n  *dev\n  *canary';

program
  .version('0.0.1')
  .arguments('<target>')
  .description(desc)
  .option('-h, --hotfix', 'This is a hotfix release (only patch version change)')
  .option('-b, --build-only', 'Only build the package and do nothing else')
  .option('-p, --publish', 'Publish the package after successful build.')
  .option('-c, --credentials [path]',
    'Path to the credentials file. Defaults to ./.credentials.json', '.credentials.json')
  .option('-t, --token',
    'Github access token. If not present the GITHUB_TOKEN variable will be used instead.')
  .option('--verbose', 'Print detailed error messages.')
  .action(function(target, options) {
    console.log();
    if (!target) {
      console.log(colors.red('  No target specified. Specify on of: stable, beta, dev or canary.'));
    }
    try {
      const script = new release.ArcRelease(target, options);
      script.run();
    } catch (e) {
      console.log(colors.red('  ' + e.message));
      console.log();
      if (options.verbose) {
        console.log(e.stack);
        console.log();
      }
      // program.outputHelp();
      process.exit(1);
    }
  })
  .on('--help', function() {
    console.log('  Examples:');
    console.log();
    console.log('    $ arc release canary --publish');
    console.log('    $ arc release beta --hotfix --publish');
    console.log('    $ arc release stable --hotfix --build-only');
    console.log();
  })
  .parse(process.argv);
