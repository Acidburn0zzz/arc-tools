#!/usr/bin/env node

'use strict';

process.title = 'arc-docs';

const program = require('commander');
const colors = require('colors/safe');
const docs = require('../lib/arc-docs');

program
  .usage('[options] [components...]')
  .option('-A, --all', 'Generate docs for all components')
  .option('--verbose', 'Display messages');

program.on('--help', () => {
  console.log('  Don\'t use --all or list components if you want to generate doc in ' +
    'current directory.');
  console.log('');
  console.log('  Examples:');
  console.log('');
  console.log('    $ arc docs --all # must be in components main directory');
  console.log('    $ arc docs raml-js-parser file-drop # must be in components main directory');
  console.log('    $ arc docs # must be in component\'s directory');
  console.log('');
});

program.parse(process.argv);

var pkgs = program.args;
console.log();
// if (!pkgs.length && !program.all) {
//   console.log(colors.red('  No components specified. Use --all to process all components.'));
//   program.outputHelp();
//   process.exit(1);
// }
var opts = {
  all: program.all || false,
  verbose: program.verbose || false
};
if (!program.all) {
  opts.components = pkgs;
}
try {
  const script = new docs.ArcDocs(opts);
  script.run().then(() => {
    process.exit(0);
  }).catch((err) => {
    console.log(colors.red('  ' + err.message));
    process.exit(1);
  });
} catch (e) {
  console.log(colors.red('  ' + e.message));
  console.log(e.stack);
  program.outputHelp();
  process.exit(1);
}
