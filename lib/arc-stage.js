'use strict';

const semver = require('semver');
const path = require('path');
const ArcBase = require('./arc-base').ArcBase;
/**
 * This script is a part of the CI process.
 * It will merge changes with master and stage branch after performing a release related tasks.
 *
 * Note, this script is intended to run after accepting a PR in the `stage` branch.
 */
class ArcStage extends ArcBase {
  constructor(opts) {
    super(opts);
    if (!opts.component || typeof opts.component !== 'string') {
      throw new Error('Invalid argument: component.');
    }
    this.component = opts.component;
    this.fullName = `advanced-rest-client/${opts.component}`;
    this.ssh = `git@github.com:${this.fullName}.git`;
    this.dir = opts.workingDir || './';
    this.componentDir = this.dir === './' ? './' : path.join(this.dir, this.component);
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
    var cloneOpts = {
      name: this.component,
      origin: 'stage',
      dir: this.dir
    };
    return this.cloneOrPull(this.ssh, cloneOpts)
    .then(() => this._fetchAll())
    .then(() => this._checkoutStage())
    .then(() => this._bump())
    .then(() => this._docs())
    .then(() => this._changelog())
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

  // Checkout master branch
  _checkoutMaster() {
    if (this.verbose) {
      console.log('Switching to master branch.');
    }
    return this.exec(`git checkout master`, this.componentDir)
    .then((result) => {
      if (this.verbose) {
        console.log('Checkout result: ', result);
      }
      return result;
    })
    .then(() => {
      if (this.verbose) {
        console.log('Reseting master');
      }
      return this.exec(`git reset --hard origin/master`, this.componentDir);
    });
  }
  // Restores branch to stage
  _checkoutStage() {
    if (this.verbose) {
      console.log('Checkout stage...');
    }
    return this.exec(`git checkout stage`, this.componentDir)
    .then((result) => {
      if (this.verbose) {
        console.log('Checkout stage result: ', result);
      }
      return result;
    });
  }
  // Bump version number.
  _bump() {
    if (this.verbose) {
      console.log('Bumping version...');
    }
    var newVer;
    var bowerFile = path.join(this.componentDir, 'bower.json');
    var packageFile = path.join(this.componentDir, 'package.json');

    return this.getFileJson(bowerFile)
    .then((bower) => {
      newVer = semver.inc(bower.version, 'patch');
      bower.version = newVer;
      return this.saveFile(bowerFile, JSON.stringify(bower, null, 2));
    })
    .then(() => this.getFileJson(packageFile))
    .then((data) => {
      data.version = newVer;
      return this.saveFile(packageFile, JSON.stringify(data, null, 2));
    });
  }
  // Generate docs for current element
  _docs() {
    if (this.verbose) {
      console.log('Making docs');
    }
    const docs = require('./arc-docs');
    var opts = {
      all: false,
      verbose: false,
      components: [this.component]
    };
    const script = new docs.ArcDocs(opts);
    return script.run();
  }
  // Create a changelog.
  _changelog() {
    if (this.verbose) {
      console.log('Creating changelog...');
    }
    return this.fileExists('./node_modules/.bin/conventional-changelog', this.componentDir)
    .catch(() => {
      if (this.verbose) {
        console.log('Installing conventional-changelog-cli...');
      }
      return this.exec(`npm install conventional-changelog-cli`, this.componentDir);
    })
    .then(() => {
      let cmd = './node_modules/.bin/conventional-changelog';
      cmd += ' -i CHANGELOG.md --same-file -p eslint';
      return this.exec(cmd, this.componentDir)
      .then((result) => {
        if (this.verbose) {
          console.log('Changelog result: ', result);
        }
        return result;
      });
    });
  }

  _fetchAll() {
    if (this.verbose) {
      console.log('Commiting changes...');
    }
    return this.exec(`git fetch --all`, this.componentDir);
  }

  // Add all changed files from current branch to commit
  _addCommnit() {
    if (this.verbose) {
      console.log('Adding files to commit...');
    }
    return this.exec(`git add -A`, this.componentDir)
    .then((result) => {
      if (this.verbose) {
        console.log('Add result: ', result);
      }
      return result;
    });
  }
  // Commit changes to the branch.
  _commitChanges() {
    if (this.verbose) {
      console.log('Commiting changes...');
    }
    return this.exec(`git commit -m "[ci skip] Automated commit after stage build."`,
      this.componentDir)
    .then((result) => {
      if (this.verbose) {
        console.log('Commit result: ', result);
      }
      return result;
    });
  }
  // Merge changes from stage to master
  _mergeMaster() {
    if (this.verbose) {
      console.log('Merging into master...');
    }

    return this.exec(`git merge -m "[ci skip] Automated merge stage->master." --no-ff stage`,
      this.componentDir)
    .then((result) => {
      if (this.verbose) {
        console.log('Push result: ', result);
      }
    });
  }
  // Push changes to the `orgin`
  _push(origin) {
    if (this.verbose) {
      console.log(`Pushing changes to ${origin}...`);
    }
    return this.exec(`git push origin ${origin}`, this.componentDir)
    .then((result) => {
      if (result.trim() === 'Everything up-to-date') {
        if (this.verbose) {
          console.log('Push not affected. Everything up-to-date.');
        }
      } else {
        if (this.verbose) {
          console.log('Push result: ', result);
        }
      }
    });
  }
}
exports.ArcStage = ArcStage;
