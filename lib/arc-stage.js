'use strict';

const fs = require('fs');
const git = require('gulp-git');
const gulp = require('gulp');
const bump = require('gulp-bump');
const exec = require('child_process').exec;
const semver = require('semver');
const conventionalChangelog = require('gulp-conventional-changelog');
/**
 * This script is a part of the CI process.
 * It will merge changes with master and stage branch after performing a release related tasks.
 *
 * Note, this script is intended to run after accepting a PR in the `stage` branch.
 */
class ArcStage {
  constructor() {
    this.pr = process.env.TRAVIS_PULL_REQUEST;
    this.commit = process.env.TRAVIS_COMMIT;
    this.branch = process.env.TRAVIS_BRANCH;

    this.allowRun = this.pr === false && this.branch === 'stage';
  }

  /**
   * get current version
   * bump-version
   * build docs
   * changelog
   * commit-changes
   * merge master
   * push master
   * merge master-stage
   * push stage (update version number, sync changes)
   */
  run() {
    if (!this.allowRun) {
      console.log('This is not a `stage` branch. Exiting quietly.');
      return Promise.resolve();
    }
    this._getCurrentVersion()
    .then(() => this._bump())
    .then(() => this._docs())
    .then(() => this._changelog())
    .then(() => this._checkoutMaster())
    .then(() => this._mergeMaster())
    .then(() => this._push('master'))
    .then(() => this._restoreStage())
    .then(() => this._mergeStage())
    .then(() => this._push('stage'));
  }

  // Get current version info from the master branch and set `this.version` variable
  _getCurrentVersion() {
    return this.__pullMaster()
    .then(() => this._checkoutMaster())
    .then(() => this.__readVersion())
    .then((version) => {
      this.version = version;
    })
    .then(() => this._restoreStage());
  }
  // Pull the master branch
  __pullMaster() {
    return new Promise((resolve, reject) => {
      git.pull('origin', ['master'], function(err) {
        if (err) {
          reject();
          return;
        }
        resolve();
      });
    });
  }
  // Checkout master branch
  _checkoutMaster() {
    return new Promise((resolve, reject) => {
      git.checkout('master', function(err) {
        if (err) {
          reject();
          return;
        }
        resolve();
      });
    });
  }
  // Read version number from the bower file.
  __readVersion() {
    return new Promise((resolve, reject) => {
      fs.readFile('./bower.json', (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        try {
          data = JSON.parse(data);
        } catch (e) {
          reject(e);
          return;
        }
        resolve(data.version);
      });
    });
  }
  // Checkout master branch
  _restoreStage() {
    return new Promise((resolve, reject) => {
      git.checkout('stage', function(err) {
        if (err) {
          reject();
          return;
        }
        resolve();
      });
    });
  }
  // Bump version number.
  _bump() {
    return new Promise((resolve, reject) => {
      if (!this.version) {
        reject(new Error('Version is not set!'));
        return;
      }
      let newVer = semver.inc(this.version, 'patch');
      gulp.src(['./bower.json', './package.json'])
      .pipe(bump({version: newVer}))
      .pipe(gulp.dest('./'))
      .on('data', function() {})
      .on('end', function() {
        resolve();
      })
      .on('error', function(e) {
        reject(e);
      });
    });
  }
  // Generate docs for current element
  _docs() {
    return new Promise((resolve, reject) => {
      exec(`arc docs`, (err) => {
        if (err) {
          reject(new Error('Unable to build docs page. ' + err.message));
          return;
        }
        resolve();
      });
    });
  }
  // Create a changelog.
  _changelog() {
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
        reject(e);
      });
    });
  }
  // Commit changes to the branch.
  _commitChanges() {
    return new Promise((resolve, reject) => {
      gulp.src('.')
      .pipe(git.add())
      .pipe(git.commit('[CI] Automated merge after stage build.'))
      .on('data', function() {})
      .on('end', function() {
        resolve();
      })
      .on('error', function(e) {
        reject(e);
      });
    });
  }
  // Merge changes from stage to master
  _mergeMaster() {
    return new Promise((resolve, reject) => {
      let opts = {
        args: '--no-ff -m "[CI] Automated merge stage->master"'
      };
      git.merge('stage', opts, function(err) {
        if (err) {
          reject(reject);
          return;
        }
        resolve();
      });
    });
  }
  // Merge changes from master to stage. Is rebase should be used here?
  _mergeStage() {
    return new Promise((resolve, reject) => {
      let opts = {
        args: '--no-ff -m "[CI] Automated merge master->stage"'
      };
      git.merge('master', opts, function(err) {
        if (err) {
          reject(reject);
          return;
        }
        resolve();
      });
    });
  }
  // Push changes to the `orgin`
  _push(origin) {
    return new Promise((resolve, reject) => {
      exec(`git push origin ${origin}`, (err) => {
        if (err) {
          reject(new Error('Unable to build docs page. ' + err.message));
          return;
        }
        resolve();
      });
    });
  }

}
exports.ArcStage = ArcStage;
