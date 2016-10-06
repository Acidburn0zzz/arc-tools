'use strict';
const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;
const colors = require('colors/safe');
const https = require('https');

/**
 * A base class with common methods for ARC cli.
 */
class ArcBase {

  constructor(opts) {
    opts = opts || {};
    this.verbose = opts.verbose || false;
    this.org = opts.org || 'advanced-rest-client';
  }

  ensurePath(path) {
    return this.pathExists(path)
    .catch(() => {
      return this._createDir(path);
    });
  }
  // Creates a directory recursively.
  _createDir(dirPath) {
    return new Promise((resolve, reject) => {
      fs.mkdir(dirPath, (error) => {
        if (error && error.code === 'ENOENT') {
          this._createDir(path.dirname(dirPath)).then(() => {
            return this._createDir(dirPath);
          })
          .then(resolve)
          .catch(reject);
        } else if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Checks if `path` exists in the filesystem.
   *
   * @param {String} path A path to check
   * @return {Promise} A promise resolves itself if `path` exists and rejects if don't.
   */
  pathExists(path) {
    return new Promise((resolve, reject) => {
      fs.access(path, fs.constants.F_OK, (err) => {
        if (err) {
          return reject();
        }
        resolve();
      });
    });
  }
  /**
   * Check specifically if directory exists. If entity exists and it's not a directory then
   * the promise rejects.
   *
   * @param {String} dirPath A path to check if it's a directory.
   * @return {Promise} A promise resolve itself if the directory exists in the filesystem and
   * rejects if `dirPath` do not exists or it's not a directory.
   */
  dirExists(dirPath) {
    return new Promise((resolve, reject) => {
      fs.stat(dirPath, (err, stat) => {
        if (err) {
          return reject(new Error(`Path ${dirPath} don't exist`));
        }
        if (stat.isDirectory()) {
          resolve();
        } else {
          return reject(new Error(`Path ${dirPath} is not a directory`));
        }
      });
    });
  }
  /**
   * Check specifically if file exists. If entity exists and it's not a file then
   * the promise rejects.
   *
   * @param {String} filePath A path to check if it's a file.
   * @return {Promise} A promise resolve itself if the file exists in the filesystem and
   * rejects if `filePath` do not exists or it's not a file.
   */
  fileExists(filePath) {
    return new Promise((resolve, reject) => {
      fs.stat(filePath, (err, stat) => {
        if (err) {
          return reject(new Error(`File ${filePath} don't exist`));
        }
        if (stat.isFile()) {
          resolve();
        } else {
          return reject(new Error(`File ${filePath} is not a directory`));
        }
      });
    });
  }
  /**
   * Clears the `dirPath` for all files in it and lives the directory itself.
   * @param {String} dirPath A path to clear.
   * @return {Promise} A promise that resolve itself if the path was cleared of its content
   * or reject if given path is not a directory or do not exists.
   */
  clearDirectory(dirPath) {
    return this.dirExists(dirPath)
    .then(() => this.exec('rm -r ./*', dirPath));
  }
  /**
   * Returns a correct path to the working dir
   *
   * @param {String} dir Absolute or relative path to the working directory.
   * @return {String} Correct path to the working directory.
   */
  _getCwd(dir) {
    if (!dir) {
      return process.cwd();
    }
    if (dir.indexOf('/') === 0) {
      return dir;
    }
    return path.join(process.cwd(), dir);
  }
  /**
   * Clones or pulls the repository in the `dir`.
   * If for give `dir` there's already a git repo then if will pull the changes from the origin.
   * Otherwise it will clone repo into given `dir`.
   * If `dir` is not passed it will perform a task in current directory.
   *
   * @param {String} url Repo url to clone.
   * @param {Object?} opts An object containing follwing keys:
   * - dir - A path where perform the operation, default to `./`
   * - origin - An orgin to pull if repo already exists. Default to `master`
   * - name - Name of the repository. It will attept to cd this name before pulling changes. If not
   * set it will try to take the name from the repo URL.
   */
  cloneOrPull(url, opts) {
    if (!url) {
      return Promise.reject(new Error('Repo url not set.'));
    }
    opts = opts || {};
    opts.dir = opts.dir || './';
    opts.origin = opts.origin || 'master';

    var dir = this._getCwd(opts.dir);
    return this.ensurePath(dir)
    .catch(() => {
      throw new Error(`Can\'t access ${dir}`);
    })
    .then(() => {
      var name = opts.name;
      if (!name) {
        name = url.substr(url.lastIndexOf('/') + 1);
        name = name.substr(0, name.lastIndexOf('.'));
      }
      let gitPath = path.join(dir, name, '.git');
      let repoDir = path.join(dir, name);
      return this.dirExists(gitPath)
      .then(() => this.pull({
        dir: repoDir,
        origin: opts.origin
      }));
    })
    .catch((err) => {
      if (err.message.indexOf('don\'t exist') !== -1) {
        return this.clone(url, {
          dir: dir
        });
      }
      throw err;
    });
  }

  /**
   * Clone the repository.
   *
   * @param {String} url A git URL to clone.
   * @param {Object?} opts An object containing follwing keys:
   * - dir - A path where perform the operation, default to `./`
   * @return {Promise} Promise resolves itself if the path was cloned or rejects if there was
   * an error parssing an error object.
   */
  clone(url, opts) {
    if (!url) {
      return Promise.reject(new Error('No url given to clone.'));
    }
    opts = opts || {};
    var dir = opts.dir || './';
    var cmd = `git clone ${url}`;
    var p;
    if (dir) {
      p = this.ensurePath(dir);
    } else {
      p = Promise.resolve();
    }
    return p
    .then(() => this.exec(cmd, dir));
  }

  /**
   * Git pull changes from the origin.
   *
   *
   * @param {Object?} opts Command options: - dir - a directory where to execute the command, by
   * default it will be current directory; - origin - an orgine from where to pull changes, by
   * default it will be `master`.
   */
  pull(opts) {
    opts = opts || {};
    var origin = opts.origin || 'master';
    var cmd = `git pull origin ${origin}`;
    var dir = opts.dir || './';

    return this.ensurePath(dir)
    .then(() => {
      //check if there's .git directory
      return this.dirExists(path.join(dir, '.git'));
    })
    .then(() => this.exec(cmd, dir))
    .catch((err) => {
      if (err.message.indexOf('don\'t exist') !== -1) {
        throw new Error(`No git repository in ${dir}`);
      } else if (err.message.indexOf('Permission denied') !== -1) {
        let m = err.message.split('\n');
        m.pop();
        m.shift();
        m.push(`In ${dir}`);
        throw new Error(m.join('\n'));
      }
      return this.exec(`git reset --hard origin ${origin}`, dir)
      .then(() => this.exec(cmd, dir));
    });
  }

  /**
   * Installs node and bower dependencies in give directory.
   *
   * @param {String?} dirPath A path where to install dependencies. If not set, current directory
   * will be used
   * @return {Promise} Promise resolve itself if dependencies were installed and rejects if not.
   * Note that it will attept to install depenedencies if bower.json and package.json exists
   * in give `dirPath`. If they not it will not attepmt to install dependencies and resolve the
   * promise. The promise rejects only if there was error while running the command on existing
   * configuration files.
   */
  deps(dirPath) {
    dirPath = dirPath || './';
    var bowerFile = path.join(dirPath, 'bower.json');
    var packageFile = path.join(dirPath, 'package.json');
    var nodeDir = path.join(dirPath, 'node_modules');
    var bowerDir = path.join(dirPath, 'bower_components');

    var _err = null;
    var message = null;

    return this.fileExists(packageFile)
    .then(() => {
      return this.dirExists(nodeDir)
      .then(() => this.exec('npm install --silent', dirPath))
      .catch(() => this.exec('npm update --dev --silent', dirPath));
    })
    .catch((err) => {
      if (err.message.indexOf('don\'t exist') === -1) {
        console.log('');
        console.log('  Unable to install node dependencies');
        console.log(err);
        _err = err;
        return;
      }
      // package.json do not exists.
      message = '  The package.json file not present. Skipping node dependencies.';
    })
    .then(() => this.fileExists(bowerFile))
    .then(() => {
      return this.dirExists(bowerDir)
      .then(() => this.exec('bower install --silent', dirPath))
      .catch(() => this.exec('bower update --save --save-dev --silent', dirPath));
    })
    .catch((err) => {
      if (err.message.indexOf('don\'t exist') === -1) {
        console.log('');
        console.log('  Unable to bower node dependencies');
        console.log(err);
        if (_err) {
          throw err;
        }
        return;
      }
      // bower.json do not exists.
      if (message) {
        message +=  '\n';
      } else {
        message = '';
      }
      message += '  The bower.json file not present. Skipping bower dependencies.';
    })
    .then(() => {
      if (message) {
        console.log('');
        console.log(`${dirPath}:`);
        console.log(colors.yellow(message));
        console.log('');
      }
    });
  }

  /**
   * Execute shell command
   *
   * @param {String} cmd Command to execute
   * @param {String?} dir A directoy where to execute the command.
   * @return {Promise} Promise resolves itself if the command was executed successfully and
   * rejects it there was an error.
   */
  exec(cmd, dir) {
    dir = dir || undefined;
    return new Promise((resolve, reject) => {
      var opts = {};
      if (dir) {
        opts.cwd = dir;
      }
      if (this.verbose) {
        console.log(`Executing command: ${cmd} in dir: ${dir}`);
      }
      exec(cmd, opts, (err, stdout, stderr) => {
        if (err) {
          let currentDir = process.cwd();
          if (opts.cwd) {
            currentDir = opts.cwd;
          }
          reject(new Error('Unable to execute command: ' + err.message +
            '. Was in dir: ' + currentDir + '. stdout: ', stdout, '. stderr: ', stderr));
          return;
        }
        resolve(stdout);
      });
    });
  }
  /**
   * Gets the repositories list from the GitHub for an organization passed as an argument
   * to the constructor (org property of the initialization object).
   * By default it is the `advanced-rest-client` organization.
   */
  getReposList() {
    return this._getReposList();
  }

  _getReposList(page, results) {
    page = page || 1;
    results = results || [];
    var linkData = null;
    var limitRemaining = null;
    var limitReset = null;
    var currentPath = `/orgs/${this.org}/repos?type=all&page=${page}`;
    var currentURL = `https://api.github.com${currentPath}`;

    return new Promise((resolve, reject) => {
      let options = {
        hostname: 'api.github.com',
        port: 443,
        path: currentPath,
        method: 'GET',
        headers: {
          'user-agent': 'advanced-rest-client/arc-tools'
        }
      };
      let req = https.request(options, (res) => {
        if (res.statusCode !== 200) {
          return reject(new Error(
            `The response to GitHub ended with status code ${res.statusCode}`));
        }
        let headers = res.headers;

        let link = headers.link;
        linkData = this._parseLink(link);
        limitRemaining = Number(headers['x-ratelimit-remaining']);
        limitReset = Number(headers['x-ratelimit-reset']);
        if (limitRemaining !== limitRemaining) {
          limitRemaining = 0;
        }
        if (limitReset !== limitReset) {
          limitReset = null;
        } else {
          limitReset *= 1000; // JS epoch time.
        }

        let data = '';
        res.on('data', (d) => {
          data += d;
        });
        res.on('end', () => {
          try {
            data = JSON.parse(data);
          } catch (e) {
            return reject(e);
          }
          results = results.concat(data);
          // Checks if there's another page of results.
          if (linkData && linkData.next && linkData.next !== currentURL) {
            if (limitRemaining === 0) {
              let message = '\n\nGitHub API rate limit reached!!\n';
              if (limitReset) {
                message += 'You can try again at ' + new Date(limitReset) + '\n\n';
              }
              console.warn(message);
              // Requests limit reached, result with all we've got.
              return resolve(results);
            }
            // Download next page of results.
            return resolve(this._getReposList(++page, results));
          }
          // That's it, calling it.
          resolve(results);
        });
      });
      req.end();
      req.on('error', (e) => {
        reject(e);
      });
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
  /**
   * Read bower file.json as JSON.
   *
   * @param {String?} dir A directory where to find bower.json file. Default to current path.
   * @return {Promise} A promise that resolves with JSON data of bower.json file or rejects if the
   * file don't exists.
   */
  getBower(dir) {
    dir = dir || process.cwd();
    var file = path.join(dir, './bower.json');
    return this.getFileJson(file);
  }
  /**
   * Read package.json file as JSON.
   *
   * @param {String?} dir A directory where to find package.json file. Default to current path.
   * @return {Promise} A promise that resolves with JSON data of package.json file or rejects
   * if the file don't exists.
   */
  getPackage(dir) {
    dir = dir || process.cwd();
    var file = path.join(dir, './package.json');
    return this.getFileJson(file);
  }
  /**
   * Reads file as JSON.
   *
   * @param {String} file A file to read.
   * @return {Promise} A promise that resolves with JSON data of the file or rejects if the
   * file don't exists.
   */
  getFileJson(file) {
    if (!file) {
      return Promise.reject(new Error(`No file specified.`));
    }
    return new Promise((resolve, reject) => {
      fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
          return reject(err);
        }
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });
  }
}
exports.ArcBase = ArcBase;