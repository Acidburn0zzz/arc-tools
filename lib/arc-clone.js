'use strict';
const fetch = require('node-fetch');
const fs = require('fs');
const git = require('gulp-git');
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
    this.noDeps = opts.noDeps || false;

    if (!this.all && !(opts.components && opts.components.length)) {
      throw new Error('You must specify list of components or use --all.');
    }
    if (this.all && opts.components && opts.components.length) {
      throw new Error('You can\'t set --all and list of components together.');
    }

    if (!this.all) {
      if (typeof opts.components === 'string') {
        opts.components = [opts.components];
      }
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

  getStructure(page, results) {
    page = page || 1;
    results = results || [];
    var init = {
      'headers': {
        'user-agent': 'advanced-rest-client/arc-tools'
      }
    };
    var linkData = null;
    var limitRemaining = null;
    var limitReset = null;
    var currentURL = `https://api.github.com/orgs/${this.repo}/repos?type=all&page=${page}`;
    return fetch(currentURL, init)
    .then((response) => {
      let link = response.headers.get('Link');
      linkData = this._parseLink(link);
      limitRemaining = Number(response.headers.get('X-RateLimit-Remaining'));
      limitReset = Number(response.headers.get('X-RateLimit-Reset'));
      if (limitRemaining !== limitRemaining) {
        limitRemaining = 0;
      }
      if (limitReset !== limitReset) {
        limitReset = null;
      } else {
        limitReset *= 1000; // JS epoch time.
      }
      return response.json();
    })
    .then((r) => {
      let res = [];
      r.forEach((item) => {
        res.push({
          name: item.name,
          // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
          ssh: item.ssh_url,
          url: item.clone_url
          // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
        });
      });
      results = results.concat(res);
      if (linkData && linkData.next && linkData.next !== currentURL) {
        if (limitRemaining === 0) {
          let message = '\n\nGitHub API rate limit reached!!\n';
          if (limitReset) {
            message += 'You can try again at ' + new Date(limitReset) + '\n\n';
          }
          console.warn(message);
          return results;
        }
        return this.getStructure(++page, results);
      }
      return results;
    });
  }
  // Parses a Link header returned by the GitHub API, required for pagination.
  _parseLink(link) {
    if (!link) {
      return null;
    }
    var parts = link.split(', ');
    var result = {
      'next': null,
      'last': null
    };
    parts.forEach((item) => this._parseLinkLine(item, result));
    return result;
  }
  // parse a part of the response's link header
  _parseLinkLine(line, src) {
    //e.g. <https://api.github.com/organizations/19393150/repos?type=all&page=2>; rel="next",
    var matches = line.match(/<(.*)?>;\srel="(.*)?"/);
    if (!matches) {
      return null;
    }
    var url = matches[1];
    var type = matches[2];
    src[type] = url;
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
    if (this.noDeps) {
      return Promise.resolve(true);
    }
    this.spinner.setSpinnerTitle(`Installing node modules ${this.counter} (${name})`);
    this.spinner.start();
    return new Promise((resolve, reject) => {
      exec(`cd ${name} && npm install`, (err, out) => {
        if (err) {
          reject(err);
          return;
        }
        console.log(out);
        this.spinner.stop(true);
        this.spinner.setSpinnerTitle(`Installing bower ${this.counter} (${name})`);
        this.spinner.start();
        exec(`cd ${name} && bower install --quiet`, (err, out) => {
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
