'use strict';
const fetch = require('node-fetch');
const fs = require('fs');
const git = require('git');
/**
 * This script is responsible for downloading and updating an ARC
 * elements from the repository (advanced-rest-client) by cloning / pulling
 * changes from GitHub.
 */
class ArcClone {
  constructor() {
    this.repo = 'advanced-rest-client';
  }

  run() {
    this.getStructure()
    .then((repos) => {
      let ps = [];
      repos.forEach((repo) => ps.push(this.clone(repo)));
      return Promise.all(ps);
    });
  }

  getStructure() {
    var init = {
      'headers': {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.0 Safari/537.36'
      }
    };
    return fetch(`https://api.github.com/orgs/${this.repo}/repos?type=all`, init)
    .then((response) => response.json())
    .then((r) => {
      let res = [];
      r.forEach((item) => {
        res.push({
          name: item.name,
          ssh: item.ssh_url
        });
      });
      return res;
    });
  }

  clone(item) {
    // name, ssh
    return new Promise((resolve, reject) => {
      fs.lstat('./' + item.name, (err, stats) => {
        if (err) {
          this._clone(item.name, item.ssh)
            .then(() => {
              resolve(true);
            })
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

  _clone(name, ssh) {
    console.log('clone', name, git);
    return git.clone(ssh, name).then(() => true);
  }

  _pull(name, ssh) {
    return Promise.resolve(true);
    //return git.Fetch.initOptions({}, 0).then(() => true);
  }
}
exports.ArcClone = ArcClone;
