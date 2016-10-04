#!/usr/bin/env node

'use strict';

process.title = 'arc-structure';

const structure = require('../lib/arc-structure');
const program = require('commander');
const colors = require('colors/safe');

program
  .usage('[options] [components...]')
  .option('-A, --all', 'update structure database for all components')
  .option('-r, --release', 'make structure elements release after adding new elements')
  .option('--verbose', 'Display messages');

program.on('--help', () => {
  console.log('  Don\'t use --all and don\'t list components if you want to update ' +
    'structure database for current directory.');
  console.log('');
  console.log('  Examples:');
  console.log('');
  console.log('    $ arc structure --all # must be in components main directory');
  console.log('    $ arc structure raml-js-parser file-drop # must be in element directory');
  console.log('    $ arc structure # must be in element directory');
  console.log('');
});

program.parse(process.argv);

var pkgs = program.args;
console.log();

var opts = {
  all: program.all || false,
  release: program.release || false,
  verbose: program.verbose || false,
  quiet: program.quiet || false
};
if (!program.all) {
  opts.components = pkgs;
}
try {
  const script = new structure.ArcStructure(opts);
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
