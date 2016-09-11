#!/usr/bin/env node

'use strict';

process.title = 'arc-clone';

const clone = require('../lib/arc-clone');
const program = require('commander');
const colors = require('colors/safe');

program
  .usage('[options] [components...]')
  .option('-S, --ssh', 'force ssh git path')
  .option('-A, --all', 'clone all repositories')
  .parse(process.argv);

var pkgs = program.args;
console.log();
if (!pkgs.length && !program.all) {
  console.log(colors.red('  No components specified. Use --all to clone all components.'));
  program.outputHelp();
  process.exit(1);
}
// if (program.ssh) {
//   console.log('  force: ssh');
// }
// pkgs.forEach(function(pkg) {
//   console.log('  install : %s', pkg);
// });
var opts = {
  ssh: program.ssh || false,
  all: program.all || false
};
if (!program.all) {
  opts.components = pkgs;
}
try {
  const script = new clone.ArcClone(opts);
  script.run();
} catch (e) {
  console.log(colors.red('  ' + e.message));
  program.outputHelp();
  process.exit(1);
}
