'use strict';
const fetch = require('node-fetch');
const fs = require('fs');
const git = require('gulp-git');
// const exec = require('exec');
const exec = require('child_process').exec;
const colors = require('colors/safe');
const Spinner = require('cli-spinner').Spinner;
/**
 * This script is responsible for downloading and updating an ARC
 * elements from the repository (advanced-rest-client) by cloning / pulling
 * changes from GitHub.
 */
class ArcClone {
  constructor(opts) {
    this.repo = 'advanced-rest-client';
    this.ssh = opts.ssh || false;
    this.all = opts.all || false;

    if (!this.all && !(opts.components && opts.components.length)) {
      throw new Error('You must specify list of components or use --all.');
    }
    if (this.all && opts.components && opts.components.length) {
      throw new Error('You can\'t set --all and list of components together.');
    }

    if (!this.all) {
      this.components = opts.components;
    }
    this.spinner = new Spinner('Processing...');
    this.spinner.setSpinnerString(18);
    this.spinner.start();
  }

  run() {
    return new Promise((resolve, reject) => {
      this.spinner.stop(true);
      this.spinner.setSpinnerTitle('Downloading repo info.');
      this.spinner.start();
      this.getStructure()
      .then((repos) => this.processStructure(repos))
      .then((repos) => {
        this.components = repos;
        this._mainPromise = {
          resolve: resolve,
          reject: reject
        };
        this.componentsLength = repos.length;
        this.currentComponent = 0;
        this.cloneNext();
      });
    });
  }

  getStructure() {
    var init = {
      'headers': {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, ' +
          'like Gecko) Chrome/47.0.2526.0 Safari/537.36'
      }
    };
    return fetch(`https://api.github.com/orgs/${this.repo}/repos?type=all`, init)
    .then((response) => response.json())
    .then((r) => {
      let res = [];
      r.forEach((item) => {
        res.push({
          name: item.name,
          ssh: item.ssh_url,
          url: item.clone_url
        });
      });
      return res;
    });
  }

  processStructure(repos) {
    this.spinner.setSpinnerTitle('Processing repo info.');
    if (this.all) {
      return repos;
    }
    this.reportInvalidRepos(repos);
    return repos.filter((item) => this.components.indexOf(item.name) !== -1);
  }

  // Check for invalid names in components list
  reportInvalidRepos(repos) {
    var filter = (name, item) => item.name === name;
    this.components.forEach((name) => {
      let items = repos.filter(filter.bind(this, name));
      if (!items || !items.length) {
        // requested component do not exists in the organization.
        console.log(colors.yellow('  Component "' + name +
          '" do not exists in this organization.'));
      }
    });
  }

  get counter() {
    return `${this.currentComponent} of ${this.componentsLength}`;
  }

  // Clone one component at a time to not block the disk with concurrent jobs.
  cloneNext() {
    var item = this.components.shift();
    if (!item) {
      this.spinner.stop(true);
      this._mainPromise.resolve();
      return;
    }
    this.currentComponent++;
    this.spinner.stop(true);
    this.spinner.setSpinnerTitle(`Component ${this.counter}`);
    this.spinner.start();
    this.clone(item)
    .then(() => this._deps(item.name))
    .then(() => {
      setTimeout(() => this.cloneNext(), 0);
    })
    .catch((e) => {
      console.log(colors.red(e.message));
      setTimeout(() => this.cloneNext(), 0);
    });
  }
  // Check if dir exists, if not clone repo or pull remote otherwise.
  clone(item) {
    return new Promise((resolve, reject) => {
      fs.lstat('./' + item.name, (err, stats) => {
        if (err) {
          let url = this.ssh ? item.ssh : item.url;
          this._clone(item.name, url)
            .then(() => resolve(true))
            .catch((err) => reject(err));
          return;
        }
        if (stats && stats.isDirectory()) {
          this._pull(item.name, item.ssh)
            .then(() => resolve(true))
            .catch((err) => reject(err));
          return;
        }
      });
    });
  }

  // Clone component into current directory.
  _clone(name, url) {
    this.spinner.stop(true);
    this.spinner.setSpinnerTitle(`Cloning:  ${this.counter}`);
    this.spinner.start();
    return new Promise((resolve, reject) => {
      git.clone(url, (err) => {
        if (err) {
          reject(err);
        } else {
          // this._deps(name).then(resolve).catch(reject);
          resolve(true);
        }
      });
    });
  }
  // Pull changes from the remote.
  _pull(name) {
    this.spinner.stop(true);
    this.spinner.setSpinnerTitle(`Git pull ${this.counter}`);
    this.spinner.start();
    return new Promise((resolve, reject) => {
      let opts = {
        cwd: './' + name
      };
      git.pull('origin', 'master', opts, (err) => {
        if (err) {
          reject(err);
        } else {
          // this._deps(name).then(resolve).catch(reject);
          resolve(true);
        }
      });
    });
  }
  // Install dependencies.
  _deps(name) {
    this.spinner.stop(true);
    this.spinner.setSpinnerTitle(`Installing node modules ${this.counter} (${name})`);
    this.spinner.start();
    return new Promise((resolve, reject) => {
      exec(`cd ${name} && npm install && bower install`, (err, out) => {
        if (err) {
          reject(err);
          return;
        }
        console.log(out);
        this.spinner.stop(true);
        this.spinner.setSpinnerTitle(`Installing bower ${this.counter} (${name})`);
        this.spinner.start();
        exec(`cd ${name} && bower install`, (err, out) => {
          if (err) {
            reject(err);
            return;
          }
          console.log(out);
          resolve(true);
        });
      });
    });
  }
}
exports.ArcClone = ArcClone;
