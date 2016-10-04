'use strict';

const GitHubApi = require('github');
const inquirer = require('inquirer');
const ArcBase = require('./arc-base').ArcBase;
const github = new GitHubApi({
  headers: {
    'user-agent': 'advanced-rest-client/arc-tools',
    'Accept': 'application/vnd.github.loki-preview+json'
  }
});

/**
 * Performs operations on GitHub repositories.
 */
class ArcRepo extends ArcBase {

  constructor(command, opts) {
    super(opts);

    this.command = command;
    this.repoName = opts.repoName || undefined;

    if (!(command in this)) {
      throw new Error(`Command ${command} is unknown.`);
    }
    this.token = opts.token || process.env.GITHUB_TOKEN || false;
    if (!this.token) {
      throw new Error('You mast set GITHUB_TOKEN env variable or pass token via --token option.');
    }
    github.authenticate({
      type: 'token',
      token: this.token
    });
  }

  run() {
    return this[this.command]()
    .then((r) => {
      console.info('Finished task');
      return r;
    });
  }

  /**
   * Creates a repository in ARC's organization with default settings.
   */
  create() {
    var p;
    if (!this.repoName) {
      p = this.getBower()
      .catch((err) => {
        console.log('');
        console.log('  No bower file. You need to pass repository name');
        throw err;
      }).then((data) => {
        if (!data.name) {
          throw new Error('Missing name in bower.json');
        }
        this.repoName = data.name;
        if (!data.description) {
          console.warn('');
          console.warn('  No description in bower.json');
        } else {
          this.description = data.description;
        }
      });
    } else {
      p = Promise.resolve();
    }
    return p
    .then(() => this._listTeams())
    .then((teams) => this._processTeams(teams))
    .then((teamId) => this._createRepo(teamId))
    .then((gitUrl) => this._initGit(gitUrl));
  }

  _createRepo(teamId) {
    var opts = {
      org: this.org,
      name: this.repoName,
      homepage: 'https://advancedrestclient.com/',
      // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
      team_id: teamId,
      has_wiki: false,
      has_downloads: false
      // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
    };
    return new Promise((resolve, reject) => {
      github.repos.createForOrg(opts, (err, res) => {
        if (err) {
          return reject(err);
        }
        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        let url = res.git_url;
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
        resolve(url);
      });
    });
  }

  _listTeams() {
    return new Promise((resolve, reject) => {
      github.orgs.getTeams({org: this.org}, (err, res) => {
        if (err) {
          return reject(err);
        }
        res = res.map((item) => {
          return {
            id: item.id,
            name: item.name,
            permission: item.permission
          };
        });
        resolve(res);
      });
    });
  }

  _processTeams(teams) {
    if (teams.length === 0) {
      throw new Error('No teams available.');
    }
    if (teams.length === 1) {
      return Promise.resolve(teams[0].id);
    }
    return this._selectTeam(teams);
  }

  _selectTeam(teams) {
    var choices = teams.map((item) => {
      item.value = item.id;
      return item;
    });
    choices.push({
      name: 'Cancel operation',
      value: 'cancel'
    });
    return inquirer.prompt([{
      type: 'list',
      name: 'teams',
      message: 'Select team which should have access to this repository',
      choices: choices
    }]).then((answers) => {
      if (answers.teams === 'cancel') {
        throw new Error('Team has not been selected.');
      }
      return answers.teams;
    });
  }

  _initGit() {
    var questions = [{
      type: 'input',
      name: 'init',
      message: 'Initialize this repository here?',
      default: function() {
        return 'yes';
      },
      validate: function(value) {
        var match = value.match(/^(yes|no)$/);
        if (match) {
          return true;
        }
        return 'Please, yes or no answer';
      }
    }];
    return inquirer.prompt(questions)
    .then((answers) => {
      if (answers.init === 'no') {
        return false;
      } else {
        return this._processInitRepo();
      }
    });
  }

  _processInitRepo() {
    return this.exec('git init')
    .then(() => this.exec('git add -A'))
    .then(() => this.exec('git commit -m "Initial commit"'))
    .then(() => this.exec(`git remote add origin git@github.com:${this.org}/${this.repoName}.git`))
    .then(() => this.exec('git checkout -b stage master'))
    .then(() => this.exec('git push origin master'))
    .then(() => this.exec('git push origin stage'))
    .then(() => this._updateBranchProtection());
  }

  _updateBranchProtection() {
    return new Promise((resolve, reject) => {
      github.repos.updateBranchProtection({
        user: this.org,
        repo: this.repoName,
        branch: 'stage',
        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        required_status_checks: {
          include_admins: false,
          strict: true,
          contexts: ['continuous-integration/travis-ci']
        },
        restrictions: null
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
      }, (err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }
}

exports.ArcRepo = ArcRepo;
