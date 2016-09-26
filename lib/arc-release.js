'use strict';

const fs = require('fs');
const conventionalChangelog = require('gulp-conventional-changelog');
const conventionalGithubReleaser = require('conventional-github-releaser');
const gulp = require('gulp');
const exec = require('child_process').exec;
const git = require('gulp-git');
const Bump = require('./bump-version.js');
const rimraf = require('rimraf');
const path = require('path');
const fsensure = require('fsensure');
const merge = require('merge-stream');
const Vulcanize = require('vulcanize');
const crisper = require('crisper');
const zipFolder = require('zip-folder');
const usemin = require('gulp-usemin');

/**
 * This script is responsible for creating a release version of the ARC app.
 * It handles versioning, changelog, Git commints and releases as well as
 * CWS upload.
 *
 * Order of tasks:
 * 1) bump version depending on the release and options
 * 2) Update changelog.
 * 3) Commit and push changes
 * 4) Create new tag and release
 * 5) Build the package (dist and build)
 * 6) Update poackage in the CWS
 * 7) Publish package
 */
class ArcRelease {

  get availableTargets() {
    return ['stable', 'beta', 'dev', 'canary'];
  }

  get buildTarget() {
    return path.join('build', this.target);
  }

  get distTarget() {
    return path.join('dist', this.target);
  }

  get cwsConfig() {
    if (!this._cwsConfig) {
      this._cwsConfig = JSON.parse(fs.readFileSync('.cws-config.json', 'utf-8'));
    }
    return this._cwsConfig;
  }

  get uploader() {
    if (!this._uploader) {
      let Uploader = require('./uploader.js').Uploader;
      let opts = {
        credentials: this.credentials
      };
      this._uploader = new Uploader(opts);
    }
    return this._uploader;
  }

  /**
   * Construct the release class.
   *
   * @param {String} target The release target. Can be one of stable, beta, dev or canary.
   * @param {Object<String, Boolean>} opts Release options. One of hotfix, buildOnly and publish.
   */
  constructor(target, opts) {
    if (this.availableTargets.indexOf(target) === -1) {
      let l = this.availableTargets.join(', ');
      throw new Error(`The target "${target}" is unknown. Please use one of: ${l}.`);
    }
    this.target = target;
    this.applyOptions(opts);
    this.checkOptions();
    this.setTargetCode();
  }

  // Creates internall target code name
  setTargetCode() {
    var code = this.target;
    if (this.hotfix && ['stable','beta'].indexOf(this.target) !== -1) {
      code += '-hotfix';
    }
    // Target code used internally to ID specific target for given options.
    this.targetCode = code;
  }

  // Apply options to current instance
  applyOptions(opts) {
    this.hotfix = opts.hotfix || false;
    this.buildOnly = opts.buildOnly || false;
    this.publish = opts.publish || false;
    this.credentials = opts.credentials || false;
    this.token = opts.token || process.env.GITHUB_TOKEN || false;
  }

  // Throws an error if combination of options is not working properly.
  checkOptions() {
    if (this.buildOnly && this.publish) {
      throw new Error('You can\'t combine --build-only and --publish options.');
    }
    if (this.publish && !this.credentials) {
      throw new Error('The path to .credentials.json file is not defined.');
    }
    if (!this.buildOnly && !this.token) {
      throw new Error('The GitHub OAuth token is not defined.');
    }
    if (this.publish) {
      // Check credentials file structure.
      this.credentialsFile();
    }

    try {
      let a = this.cwsConfig;
      a = undefined;
    } catch (e) {
      throw new Error('The .cws-config.json file is required to build the package.');
    }
  }

  /**
   * returns parsed content of the credentials file. Throws error if the file is not specified,
   * don't exists, is empty, not JSON parsable or is a template file.
   */
  credentialsFile() {
    let txt = fs.readFileSync(this.credentials, 'utf8');
    if (!txt) {
      throw new Error('The .credentials.json file is empty.');
    }
    let structure = JSON.parse(txt);
    if (!structure.web || !structure.web.clientSecret ||
      structure.web.clientSecret === '[CWS API CLIENT SECRET]') {
      throw new Error('The .credentials.json file not ready (clientSecret).' +
        'Remove --publish option.');
    }
    if (!structure.web.clientId || structure.web.clientId === '[GOOGLE CONSOLE CLIENT ID]') {
      throw new Error('The .credentials.json file not ready (clientId). Remove --publish option.');
    }
    return structure;
  }

  // Run the program.
  run() {
    console.log('Running packager.');
    if (this.buildOnly) {
      return this.readVersion()
      .then(() => this.buildPackage())
      .then((buildPath) => {
        console.log('The package is now ready. ' + buildPath);
      })
      .catch((err) => {
        console.log('Unable to build package', err);
      });
    }
    return this.bumpVersion()
    .then(() => this.changelog())
    .then(() => this.commit())
    .then(() => this.push())
    .then(() => this.tag())
    .then(() => this.buildPackage())
    .then((buildPath) => {
      if (this.publish) {
        return this.uploadPackage(buildPath)
        .then(() => this.publishPackage());
      }
      return Promise.resolve();
    })
    .then(() => {
      console.log('The package is now published.');
    })
    .catch((err) => {
      console.log('Unable to build package', err);
    });
  }

  bumpVersion() {
    console.log('Bumping version.');
    var version = Bump.bump({
      target: this.targetCode
    });
    this.version = version;
    var date = new Date().toGMTString();
    var buildName = this.target[0].toUpperCase() + this.target.substr(1);
    this.commitMessage = `[Prerelease] ${buildName} build at ${date} to version ${version}.`;
    return Promise.resolve();
  }

  readVersion() {
    this.version = JSON.parse(fs.readFileSync('package.json', 'utf-8')).version;
    var date = new Date().toGMTString();
    var buildName = this.target[0].toUpperCase() + this.target.substr(1);
    this.commitMessage = `[Prerelease] ${buildName} build at ${date} to version ${this.version}.`;
    return Promise.resolve();
  }

  changelog() {
    console.log('Updating changelog.');
    return new Promise((resolve, reject) => {
      gulp.src('CHANGELOG.md', {
        buffer: false
      })
      .pipe(conventionalChangelog({
        preset: 'eslint'
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

  commit() {
    console.log('Commiting changes.');
    return new Promise((resolve, reject) => {
      exec('git add -A', (err) => {
        if (err) {
          reject(new Error('Unable to add all files to commit'));
          return;
        }
        exec(`git commit -m "${this.commitMessage}"`, (err) => {
          if (err) {
            reject(new Error('Unable to commit files. ' + err.message));
            return;
          }
          resolve();
        });
      });
    });
  }

  push() {
    return new Promise((resolve, reject) => {
      git.push('origin', 'master', (err) => {
        if (err) {
          reject(err);
          return;
        }
        git.push('origin', 'develop', (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      });
    });
  }

  tag() {
    return new Promise((resolve, reject) => {
      git.tag(this.version, 'Created Tag for version: ' + this.version, {signed: true}, (err) => {
        if (err) {
          reject(err);
          return;
        }
        git.push('origin', 'master', {args: '--tags'}, (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      });
    });
  }

  gitHubRelease() {
    return new Promise((resolve, reject) => {
      conventionalGithubReleaser({
        type: 'oauth',
        token: this.token
      }, {
        preset: 'eslint' // Or to any other commit message convention you use.
      }, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  buildPackage() {
    return this.copyApp()
    .then(() => this._createPackage());
  }

  copyApp() {
    return this._cleanTarget()
    .then(() => this._ensureBowerComponents())
    .then(() => this._ensureDirStructure())
    .then(() => this._copyFiles())
    .then(() => this._vulcanizeElements())
    .then(() => this._processManifest())
    .then(() => this._processIndexFile())
    .then(() => this._applyBranding())
    .then(() => {
      console.log('All files copied.');
    });
  }

  _cleanTarget() {
    return new Promise((resolve, reject) => {
      let dir = this.buildTarget;
      rimraf(dir, (err) => {
        if (err) {
          console.error('Can\'t remove path ', dir);
          reject(err);
          return;
        }
        // console.log('Dir removed for target: ' + dir);
        resolve();
      });
    });
  }

  /**
   * Vulcanizer need to have bower_components in root path.
   */
  _ensureBowerComponents() {
    console.log('Ensure bower components exists.');
    return new Promise((resolve) => {
      try {
        fs.lstat('./bower_components', (err, stats) => {
          if (err) {
            fs.symlink('./app/bower_components/', './bower_components', 'dir', () => {
              resolve();
            });
            return;
          }
          if (!stats.isSymbolicLink()) {
            fs.symlink('./app/bower_components/', './bower_components', 'dir', () => {
              resolve();
            });
            return;
          }
          // console.log('Bower symlink exists');
          resolve();
        });
      } catch (e) {
        fs.symlink('./app/bower_components/', './bower_components', 'dir', () => {
          resolve();
        });
      }
    });
  }

  /**
   * Make sure we have all directories structure ready.
   */
  _ensureDirStructure() {
    console.log('Ensure directory structure exists');
    var structure = [
      'build/canary/elements',
      'build/dev/elements',
      'build/beta/elements',
      'build/stable/elements'
    ];
    var promises = [];
    structure.forEach((path) => promises.push(this._ensureDir(path)));
    return Promise.all(promises);
    // .then(() => {
    //   console.log('Directory structure OK');
    // });
  }

  _ensureDir(path) {
    // console.log('Creating dir', path);
    return new Promise((resolve, reject) => {
      // console.log('Calling mkdir');
      fsensure.dir.exists(path, (err) => {
        // console.log('Path exists', path);
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Copy files that are not copied by vulcanize process.
   */
  _copyFiles() {
    console.log('Copying files...');
    return new Promise((resolve, reject) => {
      this._gulpCopyFiles()
      .on('data', function() {})
      .on('end', function() {
        resolve();
      })
      .on('error', function(e) {
        reject(e);
      });
    });
  }

  _gulpCopyFiles() {
    var app = gulp.src([
      'app/*',
      '!app/index.html',
      '!app/test',
      '!app/elements',
      '!app/bower_components',
      '!**/.DS_Store'
    ], {
      dot: true
    }).pipe(gulp.dest(this.buildTarget));

    var assets = gulp.src([
      'app/assets/*',
    ]).pipe(gulp.dest(path.join(this.buildTarget, 'assets')));

    var scripts = gulp.src([
      'app/scripts/**',
      // '!app/scripts/libs',
      // '!app/scripts/libs/*',
      '!app/scripts/code-mirror',
      '!app/scripts/code-mirror/**'
    ]).pipe(gulp.dest(path.join(this.buildTarget, 'scripts')));

    var styles = gulp.src([
      'app/styles/*',
      '!app/styles/*.html'
    ]).pipe(gulp.dest(path.join(this.buildTarget, 'styles')));

    // Copy over only the bower_components we need
    // These are things which cannot be vulcanized
    var bower = gulp.src([
      'app/bower_components/{webcomponentsjs,font-roboto-local,codemirror,prism/components,' +
        'cookie-parser}/**/*',
      '!app/bower_components/codemirror/lib/**',
      '!app/bower_components/codemirror/theme/**',
      '!app/bower_components/codemirror/keymap/**',
      '!app/bower_components/codemirror/*',
      '!app/bower_components/font-roboto-local/fonts/robotomono/**'
    ]).pipe(gulp.dest(path.join(this.buildTarget, 'bower_components')));

    // copy webworkers used in bower_components
    var webWorkers = gulp.src([
      'app/bower_components/socket-fetch/decompress-worker.js'
    ]).pipe(gulp.dest(path.join(this.buildTarget, 'elements')));

    // zlib library need to placed folder up relativelly to decompress-worker
    var zlibLibrary = gulp.src([
      'app/bower_components/zlib/bin/zlib_and_gzip.min.js'
    ]).pipe(gulp.dest(path.join(this.buildTarget, 'zlib', 'bin')));

    var bowerDeps = [
      'chrome-platform-analytics/google-analytics-bundle.js',
      'dexie-js/dist/dexie.min.js',
      'har/build/har.js',
      'lodash/lodash.js',
      'uri.js/src/URI.js',
      'prism/prism.js',
      'prism/plugins/autolinker/prism-autolinker.min.js'
    ];
    var dependencies = gulp.src([
      `app/bower_components/{${bowerDeps.join(',')}}`,
    ]).pipe(gulp.dest(path.join(this.buildTarget, 'bower_components')));

    return merge(
      app, bower, webWorkers, assets, scripts, styles,
      /*, codeMirror*/
      zlibLibrary, dependencies
    );
  }

  _vulcanizeElements() {
    // console.log('Vulcanizing');
    return new Promise((resolve, reject) => {
      let targetDir = this.buildTarget;
      let source = path.join('app', 'elements', 'elements.html');
      let vulcan = new Vulcanize({
        inlineScripts: true,
        inlineCss: true,
        implicitStrip: true,
        stripComments: true,
        excludes: [
          // path.join('app', 'bower_components', 'font-roboto', 'roboto.html'),
          // path.join('bower_components', 'font-roboto', 'roboto.html')
        ]
      });
      console.log('Processing elements.html');
      vulcan.process(source, function(err, inlinedHtml) {
        if (err) {
          return reject(err);
        }
        let jsFile = 'elements.js';
        var targetHtml = path.join(targetDir, 'elements', 'elements.html');
        var targetJs = path.join(targetDir, 'elements', jsFile);
        let output = crisper({
          source: inlinedHtml,
          jsFileName: jsFile,
          scriptInHead: false
        });
        fs.writeFileSync(targetHtml, output.html, 'utf-8');
        fs.writeFileSync(targetJs, output.js, 'utf-8');
        console.log('Saved in ', targetHtml, targetJs);
        resolve();
      });
    });
  }

  //combine all manifest dependecies into one file
  _processManifest() {
    return new Promise((resolve, reject) => {
      let dest = this.buildTarget;
      let targetName = this.target;
      let manifestFile = path.join(dest, 'manifest.json');

      fs.readFile(manifestFile, (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        data = JSON.parse(data);
        //jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        //write new path to manifest
        if (targetName === 'canary') {
          data.name += ' - canary';
          data.short_name += ' - canary';
        } else if (targetName === 'dev') {
          data.name += ' - dev';
          data.short_name += ' - dev';
        } else if (targetName === 'beta') {
          data.name += ' - beta';
          data.short_name += ' - beta';
        }
        let cwsConfig = this.cwsConfig;
        data.oauth2.client_id = cwsConfig[targetName].clientId;
        //jscs:enable requireCamelCaseOrUpperCaseIdentifiers
        delete data.key;
        data = JSON.stringify(data, null, 2);
        fs.writeFile(manifestFile, data, 'utf8', (err) => {
          if (err) {
            console.error('Error building background page dependencies file.', err);
            reject(err);
            return;
          }
          resolve();
        });
      });
    });
  }

  /**
   * Process the index.html file.
   */
  _processIndexFile() {
    return new Promise((resolve, reject) => {
      gulp.src('./app/index.html')
      .pipe(usemin({
        css: [],
        html: [],
        js: [],
        inlinejs: [],
        inlinecss: []
      }))
      .pipe(gulp.dest(this.buildTarget))
      .on('data', function() {})
      .on('end', function() {
        resolve();
      })
      .on('error', function(e) {
        reject(e);
      });
    });
  }

  /**
   * Create a package
   */
  _createPackage() {
    return new Promise((resolve, reject) => {
      // let build = Builder.buildTarget;
      var options = {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      };
      var date = new Intl.DateTimeFormat(undefined, options).format(new Date());
      date = date.replace(/\//g, '-');
      let fileName = `${this.target}-${this.version}@${date}.zip`;
      let dist = path.join(this.distTarget, fileName);
      fsensure.dir.exists(this.distTarget, (err) => {
        if (err) {
          console.error('Creating package folders structure error', err);
          reject(err);
        } else {
          zipFolder(this.buildTarget, dist, (err) => {
            if (err) {
              console.error('Creating package file error', err);
              reject(err);
            }
            resolve(dist);
          });
        }
      });
    });
  }

  // Apply branding depending on the release.
  _applyBranding() {
    var srcIcons = [
      path.join('branding', this.target, 'arc_icon_128.png'),
      path.join('branding', this.target, 'arc_icon_48.png'),
      path.join('branding', this.target, 'arc_icon_32.png'),
      path.join('branding', this.target, 'arc_icon_16.png')
    ];
    var destIcons = [
      path.join(this.buildTarget, 'assets', 'arc_icon_128.png'),
      path.join(this.buildTarget, 'assets', 'arc_icon_48.png'),
      path.join(this.buildTarget, 'assets', 'arc_icon_32.png'),
      path.join(this.buildTarget, 'assets', 'arc_icon_16.png')
    ];
    var promises = [];
    var copy = (file, i) => {
      return new Promise((resolve, reject) => {
        try {
          let buffer = fs.readFileSync(file);
          fs.writeFileSync(destIcons[i], buffer);
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    };
    srcIcons.forEach((file, i) => promises.push(copy(file, i)));
    return Promise.all(promises);
  }

  uploadPackage(buildPath) {
    return this.uploader.uploadItem(buildPath, this.target);
  }

  /**
   * Publish package after it has been uploaded. If it is done in the same run it does not require
   * another auth.
   */
  publishPackage() {
    return this.uploader.publishTarget(this.target);
  }
}

exports.ArcRelease = ArcRelease;
