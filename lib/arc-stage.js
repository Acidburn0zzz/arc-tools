'use strict';

const fs = require('fs');
const gulp = require('gulp');
const bump = require('gulp-bump');
const exec = require('child_process').exec;
const semver = require('semver');
const conventionalChangelog = require('gulp-conventional-changelog');
const path = require('path');
const fsensure = require('fsensure');

/**
 * This script is a part of the CI process.
 * It will merge changes with master and stage branch after performing a release related tasks.
 *
 * Note, this script is intended to run after accepting a PR in the `stage` branch.
 */
class ArcStage {
  constructor(opts) {
    if (!opts.component || typeof opts.component !== 'string') {
      throw new Error('Invalid argument: component.');
    }
    this.component = opts.component;
    this.fullName = `advanced-rest-client/${opts.component}`;
    this.ssh = `git@github.com:${this.fullName}.git`;
    this.dir = opts.workingDir || './';
    this.workingDir = path.join(this.dir, this.component);
    this.verbose = opts.verbose || false;
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
    if (this.verbose) {
      console.log('Running stage.');
    }
    return this._clearWorkingDir()
    .then(() => this._ensureWorkingDir())
    .then(() => this._clone())
    .then(() => this._getCurrentVersion())
    .then(() => this._checkoutStage())
    .then(() => this._bump())
    .then(() => this._docs())
    // .then(() => this._changelog().catch(() => {}))
    .then(() => this._addCommnit())
    .then(() => this._commitChanges())
    .catch((err) => {
      console.error(err);
      throw new Error('Operation failed.');
    })
    .then(() => this._checkoutMaster())
    .then(() => this._mergeMaster())
    .then(() => this._push('master'))
    .catch((err) => {
      console.error(err);
      throw new Error('Operation failed.');
    })
    .then(() => this._checkoutStage())
    .then(() => this._push('stage'))
    .then(() => {
      console.log('Element deployed.');
    });
  }

  _ensureWorkingDir() {
    if (this.verbose) {
      console.log('Building dir path for ' + this.dir);
    }
    try {
      fs.accessSync(this.dir, fs.F_OK);
      return Promise.resolve();
    } catch (e) {}
    return new Promise((resolve, reject) => {
      fsensure.dir.exists(this.dir, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  _clearWorkingDir() {
    return this._exec(`cd .. && rm -rf -- ${this.dir}`, this.dir)
    .catch(() => {});
  }

  _clone() {
    if (this.verbose) {
      console.log('Cloning repo ' + this.component);
    }
    return this._exec(`git clone ${this.ssh}`, this.dir);
  }

  // Get current version info from the master branch and set `this.version` variable
  _getCurrentVersion() {
    if (this.verbose) {
      console.log('Retriving current version from master branch [4 subtasks].');
    }
    return this.__readVersion()
    .then((version) => {
      this.version = version;
    });
  }
  // Checkout master branch
  _checkoutMaster() {
    if (this.verbose) {
      console.log('Switching to master branch.');
    }
    return this._exec(`git checkout master`);
  }
  // Read version number from the bower file.
  __readVersion() {
    if (this.verbose) {
      console.log('Reading current version from bower.');
    }
    return new Promise((resolve, reject) => {
      let file = path.join(this.workingDir, 'bower.json');
      fs.readFile(file, (err, data) => {
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
  _checkoutStage() {
    if (this.verbose) {
      console.log('Checkout stage...');
    }
    return this._exec(`git checkout stage`);
  }
  // Bump version number.
  _bump() {
    if (this.verbose) {
      console.log('Bumping version...');
    }
    return new Promise((resolve, reject) => {
      if (!this.version) {
        reject(new Error('Trying to bum by this.version is not set!'));
        return;
      }
      let newVer = semver.inc(this.version, 'patch');
      let files = [
        path.join(this.workingDir, 'bower.json'),
        path.join(this.workingDir, 'package.json')
      ];
      gulp.src(files)
      .pipe(bump({version: newVer}))
      .pipe(gulp.dest(this.workingDir))
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
    if (this.verbose) {
      console.log('Making docs');
    }
    return this._exec('arc docs');
  }
  // Create a changelog.
  _changelog() {
    if (this.verbose) {
      console.log('Creating changelog...');
    }
    return new Promise((resolve, reject) => {
      let file = path.join(this.workingDir, 'CHANGELOG.md');
      gulp.src(file)
      .pipe(conventionalChangelog({
        preset: 'eslint',
        config: {
          pkg: {
            path: path.join(this.workingDir, 'package.json')
          }
        }
      }))
      .pipe(gulp.dest(this.workingDir))
      .on('data', function() {})
      .on('end', function() {
        resolve();
      })
      .on('error', function(e) {
        reject(new Error('Can not create changelog. ' + e.message));
      });
    });
  }
  // Add all changed files from current branch to commit
  _addCommnit() {
    if (this.verbose) {
      console.log('Adding files to commit...');
    }
    return this._exec(`git add -A`);
  }
  // Commit changes to the branch.
  _commitChanges() {
    if (this.verbose) {
      console.log('Commiting changes...');
    }
    return this._exec(`git commit -m "[CI] Automated commit after stage build."`);
  }
  // Merge changes from stage to master
  _mergeMaster() {
    if (this.verbose) {
      console.log('Merging into master...');
    }
    return this._exec(`git merge --no-ff -m "[CI] Automated merge stage->master"`);
  }
  // Push changes to the `orgin`
  _push(origin) {
    if (this.verbose) {
      console.log(`Pushing changes to ${origin}...`);
    }
    return this._exec(`git push origin ${origin}`);
  }

  _exec(cmd, dir) {
    dir = dir || this.workingDir;
    if (this.verbose) {
      console.log(`Executing command: ${cmd} in dir: ${dir}`);
    }
    return new Promise((resolve, reject) => {
      exec(cmd, {cwd: dir}, (err, stdout) => {
        if (err) {
          console.log(err);
          reject(new Error('Unable to execute command: ' + err.message));
          return;
        }
        resolve(stdout);
      });
    });
  }

}
exports.ArcStage = ArcStage;
