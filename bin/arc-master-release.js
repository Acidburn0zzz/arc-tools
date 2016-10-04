#!/usr/bin/env node

'use strict';

var conventionalGithubReleaser = require('conventional-github-releaser');
const program = require('commander');

process.title = 'arc-master-release';

program
  .usage('[options]')
  .parse(process.argv);

function release() {
  return new Promise((resolve, reject) => {
    conventionalGithubReleaser({
      type: 'oauth',
      token: process.env.GITHUB_TOKEN
    }, {
      preset: 'eslint'
    }, (err) => {
      if (err) {
        return reject(err);
      }
      return resolve();
    });
  });
}

// var pkg = program.args;
// if (pkg.length > 1 || pkg.length === 0) {
//   console.log('  Invalid number of components. Only one is allowed.');
//   program.outputHelp();
//   process.exit(1);
// }

release()
.then(() => {
  process.exit(0);
})
.catch((err) => {
  console.error(err);
  process.exit(1);
});
