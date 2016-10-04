'use strict';
const path = require('path');
const colors = require('colors/safe');
const ArcBase = require('./arc-base').ArcBase;
/**
 * This script is responsible for downloading and updating an ARC
 * elements from the repository (advanced-rest-client) by cloning / pulling
 * changes from GitHub.
 */
class ArcClone extends ArcBase {
  constructor(opts) {
    super(opts);

    this.ssh = opts.noSsh ? false : true;
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
  }

  run() {
    if (this.verbose) {
      console.log(`Running clone command.`);
    }
    return new Promise((resolve, reject) => {
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
    if (this.verbose) {
      console.log(`Getting list of repositories in ${this.org}.`);
    }
    return this.getReposList()
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
      return res;
    });
  }

  processStructure(repos) {
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

  // Clone one component at a time to not block the disk with concurrent jobs.
  cloneNext() {
    var item = this.components.shift();
    if (!item) {
      this._mainPromise.resolve();
      return;
    }
    this.currentComponent++;
    if (this.verbose) {
      console.log(`Clonning repo ${this.currentComponent} of ${this.componentsLength}.`);
    }

    var url = this.ssh ? item.ssh : item.url;
    var itemDir = item.name;
    this.cloneOrPull(url)
    .then(() => {
      if (this.verbose) {
        console.log(`Installing depenedencies for ${item.name}.`);
      }
      return this.deps(itemDir);
    })
    .then(() => {
      setTimeout(() => this.cloneNext(), 0);
    })
    .catch((e) => {
      this._mainPromise.reject(e);
    });
  }
}
exports.ArcClone = ArcClone;
