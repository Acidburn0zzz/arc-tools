#!/usr/bin/env node

'use strict';

process.title = 'arc-changelog';

const colors = require('colors/safe');
const gulp = require('gulp');
const conventionalChangelog = require('gulp-conventional-changelog');

function makeChangelog() {
  console.log('Creating changelog...');
  return new Promise((resolve, reject) => {
    gulp.src('CHANGELOG.md', {
        buffer: false
      })
      .pipe(conventionalChangelog({
        preset: 'eslint' // Or to any other commit message convention you use.
      }))
      .pipe(gulp.dest('./'))
      .on('data', function() {})
      .on('end', function() {
        resolve();
      })
      .on('error', function(e) {
        reject(new Error('Can not create changelog. ' + e.message));
      });
  });
}

try {
  makeChangelog().then(() => {
    process.exit(0);
  }).catch((err) => {
    console.log(err);
    process.exit(1);
  });
} catch (e) {
  console.log(colors.red('  ' + e.message));
  process.exit(1);
}
