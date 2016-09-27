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
  constructor(opts) {
    this.pr = String(process.env.TRAVIS_PULL_REQUEST);
    this.commit = String(process.env.TRAVIS_COMMIT); // commit id
    this.branch = String(process.env.TRAVIS_BRANCH);
    this.test = opts.test;
    this.isTravis = String(process.env.TRAVIS) === 'true';
    // console.log(process.env);
    // console.log(this.pr === 'false' && this.branch === 'stage', this.pr === 'false',
    //   this.branch === 'stage');
    this.allowRun = !this.isTravis || (this.isTravis &&
        this.pr === 'false' && this.branch === 'stage');
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
    console.log('Running release script.');
    return this._getCurrentVersion()
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
    console.log('Retriving current version from master branch.');
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
    console.log('Pulling master branch.');
    return new Promise((resolve, reject) => {
      git.pull('origin', ['master'], function(err) {
        if (err) {
          reject(new Error('Can not pull master branch. ' + err.message));
          return;
        }
        resolve();
      });
    });
  }
  // Checkout master branch
  _checkoutMaster() {
    return new Promise((resolve, reject) => {
      console.log('Checkout master branch.');
      git.checkout('master', function(err) {
        if (err) {
          reject(new Error('Can not pull master branch. ' + err.message));
          return;
        }
        resolve();
      });
    });
  }
  // Read version number from the bower file.
  __readVersion() {
    console.log('Reading current version from bower.');
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
  // Restores branch to stage
  _restoreStage() {
    console.log('Restoring branch to stage...');
    return new Promise((resolve, reject) => {
      git.checkout('stage', function(err) {
        if (err) {
          reject(new Error('Can not restore branch to stage. ' + err.message));
          return;
        }
        resolve();
      });
    });
  }
  // Bump version number.
  _bump() {
    console.log('Bumping version...');
    return new Promise((resolve, reject) => {
      if (!this.version) {
        reject(new Error('Trying to bum by this.version is not set!'));
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
        reject(new Error('Can not bump version. ' + e.message));
      });
    });
  }
  // Generate docs for current element
  _docs() {
    var docs = require('./arc-docs');
    var opts = {};
    var script = new docs.ArcDocs(opts);
    return script.run();
  }
  // Create a changelog.
  _changelog() {
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
  // Commit changes to the branch.
  // _commitChanges() {
  //   console.log('Commiting changes...');
  //   return new Promise((resolve, reject) => {
  //     gulp.src('.')
  //     .pipe(git.add())
  //     .pipe(git.commit('[CI] Automated merge after stage build.'))
  //     .on('data', function() {})
  //     .on('end', function() {
  //       resolve();
  //     })
  //     .on('error', function(e) {
  //       reject(new Error('Can not commit changes. ' + e.message));
  //     });
  //   });
  // }
  // Merge changes from stage to master
  _mergeMaster() {
    console.log('Merging into master...');
    return new Promise((resolve, reject) => {
      let opts = {
        args: '--no-ff -m "[CI] Automated merge stage->master"'
      };
      git.merge('stage', opts, function(err) {
        if (err) {
          reject(new Error('Can not merge master. ' + err.message));
          return;
        }
        resolve();
      });
    });
  }
  // Merge changes from master to stage. Is rebase should be used here?
  _mergeStage() {
    console.log('Merging master with stage...');
    return new Promise((resolve, reject) => {
      let opts = {
        args: '--no-ff -m "[CI] Automated merge master->stage"'
      };
      git.merge('master', opts, function(err) {
        if (err) {
          reject(new Error('Can not merge stage with master. ' + err.message));
          return;
        }
        resolve();
      });
    });
  }
  // Push changes to the `orgin`
  _push(origin) {
    console.log(`Pushing changes to ${origin}...`);
    return new Promise((resolve, reject) => {
      // let cmd = '';
      // if (this.isTravis) {
      //   cmd = `ssh-agent bash -c 'ssh-add ./github_rsa; ssh-add ./github_rsa.pub; `;
      // } else {
      //   cmd = `ssh-agent bash -c 'ssh-add ~/.ssh/github_rsa; ssh-add ~/.ssh/github_rsa.pub; `;
      // }
      // exec(`${cmd}git push origin ${origin}'`, (err) => {
      exec(`./tasks/commit ${origin}'`, (err) => {
        if (err) {
          reject(new Error('Unable to push changes. ' + err.message));
          return;
        }
        resolve();
      });
    });
  }

}
exports.ArcStage = ArcStage;
