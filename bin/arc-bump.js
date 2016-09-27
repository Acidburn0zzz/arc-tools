#!/usr/bin/env node

'use strict';

process.title = 'arc-bump';

const program = require('commander');
const colors = require('colors/safe');
const semver = require('semver');
const gulp = require('gulp');
const bump = require('gulp-bump');

program
  .usage('[options] <version>')
  .parse(process.argv);

var currentVersion = program.args && program.args[0];
console.log();
if (!currentVersion) {
  console.log(colors.red('  No components specified. Use --all to clone all components.'));
  program.outputHelp();
  process.exit(1);
}

if (!/^\d+\.\d+\.\d+$/.test(currentVersion)) {
  console.log(colors.red('  Specified version is invalid. Please, use semver.'));
  program.outputHelp();
  process.exit(1);
}

function bumpCurrent(currentVersion) {
  return new Promise((resolve, reject) => {
    let newVer = semver.inc(currentVersion, 'patch');
    console.log('Bumping version from ' + currentVersion + ' to ' + newVer + '...');
    gulp.src(['./bower.json', './package.json'])
    .pipe(bump({version: newVer}))
    .pipe(gulp.dest('./'))
    .on('data', function() {})
    .on('end', function() {
      resolve();
    })
    .on('error', function(e) {
      reject(new Error('Can not bump version. ' + e.message));
    });
  });
}

try {
  bumpCurrent(currentVersion).then(() => {
    process.exit(0);
  }).catch((err) => {
    console.log(err);
    process.exit(1);
  });
} catch (e) {
  console.log(colors.red('  ' + e.message));
  program.outputHelp();
  process.exit(1);
}
