'use strict';
const fs = require('fs');
const colors = require('colors/safe');
const exec = require('child_process').exec;
const Spinner = require('cli-spinner').Spinner;
const hyd = require('hydrolysis');
const path = require('path');
const parse5 = require('parse5');

class ArcStructure {

  get elementsParents() {
    return ['chrome-elements', 'logic-elements', 'raml-elements', 'transport-elements',
      'ui-elements'];
  }

  get ignored() {
    var list = ['arc-datastore', 'arc-tools', 'polymd', 'bower_components', 'cookie-parser',
    'har', 'arc-element-catalog', 'ci-server'];
    return list.concat(this.elementsParents);
  }

  constructor(opts) {
    this.all = opts.all || false;
    this.verbose = opts.verbose || false;
    this.release = opts.release || false;
    this.quiet = opts.quiet || false;

    if (!this.all && !(opts.components && opts.components.length)) {
      this.current = true;
    } else {
      this.current = false;
    }
    if (this.all && opts.components && opts.components.length) {
      throw new Error('You can\'t use --all and list of components together.');
    }

    if (!this.all && !this.current) {
      this.components = opts.components;
    }
    if (this.verbose) {
      console.log('  ArcStructure configured');
      console.log('  --all    ', this.all);
      console.log('  --verbose    ', this.verbose);
      console.log('  --current    ', this.current);
      console.log('  --components    ', this.components);
      console.log('  --quiet    ', this.quiet);
    }
    if (!this.quiet) {
      this.spinner = new Spinner('Processing...');
      this.spinner.setSpinnerString(18);
    }
  }

  run() {
    if (this.spinner) {
      this.spinner.start();
    }
    return this._listComponents()
    .then((r) => this._clearComponentsList(r))
    .then((r) => this._generateStructure(r))
    .then((r) => this._organizeStructure(r))
    .then((r) => this._updateGroups(r))
    .then((arr) => {
      if (this.release) {
        if (this.verbose) {
          console.log('Publishing group elements', arr);
        }
        return this._publish(arr);
      }
    })
    .then(() => {
      if (this.spinner) {
        this.spinner.stop(true);
      }
    })
    .catch((e) => {
      if (this.spinner) {
        this.spinner.stop(true);
      }
      throw e;
    });
  }

  _listComponents() {
    if (this.verbose) {
      console.log('  Listing components');
    }
    if (this.current) {
      return this._processBower('.').then((res) => [res]);
    }
    if (!this.all) {
      let p = [];
      this.components.forEach((file) => p.push(this._processBower(file)));
      return Promise.all(p);
    }
    return new Promise((resolve, reject) => {
      fs.readdir('./', (err, files) => {
        if (err) {
          reject(err);
          return;
        }
        let p = [];
        files.forEach((file) => p.push(this._processBower(file)));
        Promise.all(p).then(resolve).catch(reject);
      });
    });
  }

  _processBower(entry) {
    if (this.verbose) {
      console.log('  Processing bower for ', entry);
    }
    return this._getBowerMain(entry)
    .catch((err) => {
      if (this.verbose) {
        console.log('Error getttng main bower entry for ', entry, err.message);
      }
    })
    .then((result) => {
      if (!result) {
        return null;
      }
      if (entry === '.') {
        let fullPath = process.argv[1];
        entry = fullPath.split('/').pop();
      }
      return {
        element: entry,
        main: result
      };
    });
  }

  _getBowerMain(path) {
    if (this.verbose) {
      console.log('  Reading bower\'s main element', path);
    }
    return new Promise((resolve, reject) => {
      let bowerFile = path + '/bower.json';
      // console.log('Reading file: ', bowerFile);
      fs.readFile(bowerFile, 'utf8', (err, data) => {
        if (err) {
          reject(new Error('No bower.json file.'));
          return;
        }
        data = JSON.parse(data);
        if (!data.main) {
          reject(new Error('No "main" entry in the bower.json file.'));
          return;
        }
        resolve(data.main);
      });
    });
  }

  _clearComponentsList(list) {
    if (this.verbose) {
      console.log('  Clearing components list', list);
    }
    var ignored = this.ignored;
    list = list.filter((item) => {
      if (!item) {
        return false;
      }
      if (ignored.indexOf(item.element) !== -1) {
        return false;
      }
      return true;
    });
    return list;
  }

  /**
   * Parses every "main" entry, analyses it strucure with hydrolisys and checks to
   * which parent element it belongs.
   */
  _generateStructure(list) {
    if (this.verbose) {
      console.log('  Generating structure for', list.map((i) => i.element));
    }
    if (this.spinner) {
      this.spinner.stop(true);
      this.spinner.setSpinnerTitle('Getting structure information.');
      this.spinner.start();
    }
    var p = [];
    list.forEach((item) => {
      p.push(this._readStructureInfo(item));
    });
    return Promise.all(p);
  }

  _readStructureInfo(item) {
    if (this.verbose) {
      console.log('  Reading structure info', item.element);
    }
    if (this.spinner) {
      this.spinner.stop(true);
      this.spinner.setSpinnerTitle('Analysing component.');
      this.spinner.start();
    }

    var file = item.element + '/';
    var main = item.main;
    if (main instanceof Array) {
      if (main.indexOf(item.element + '.html') !== -1) {
        main = item.element + '.html';
      } else {
        main = main[0] + '.html'; // Is this OK?
      }
    }
    file += main;
    item.main = main;

    return hyd.Analyzer.analyze(file)
    .then((analyzer) => {
      // console.log(analyzer);
      if (this.verbose) {
        console.log('  Analyzed main file', file);
      }
      if (!analyzer || !analyzer.elementsByTagName || !analyzer.elementsByTagName[item.element]) {
        if (this.verbose) {
          console.warn('  There were mo element documentation for main file', file);
        }
        return false;
      }
      let elm = analyzer.elementsByTagName[item.element];
      let tag = null;
      if (elm.jsdoc.tags) {
        elm.jsdoc.tags.forEach((item) => {
          if (item.tag === 'group') {
            tag = item.description.toLowerCase();
          }
        });
      }
      if (!tag) {
        return null;
      }
      item.parent = tag;
      return item;
    });
  }

  _organizeStructure(list) {
    list = list.filter((item) => !!item);
    var groups = {};
    list.forEach((item) => {
      if (!(item.parent in groups)) {
        groups[item.parent] = [];
      }
      groups[item.parent].push(item);
    });
    return groups;
  }

  _updateGroups(groups) {
    if (this.verbose) {
      console.log('  Updating group elements (adding missing components)');
    }
    if (this.spinner) {
      this.spinner.stop(true);
      this.spinner.setSpinnerTitle('Updating structure info.');
      this.spinner.start();
    }
    var promises = [];
    for (let groupElement in groups) {
      let data = groups[groupElement];
      let element = groupElement.replace(/\s/g, '-');
      promises.push(this._updateGroup(element, data));
    }
    return Promise.all(promises);
  }

  _updateGroup(groupElement, data) {
    if (this.verbose) {
      console.log('  Updating group data', groupElement);
    }
    var cmpCmd = '';
    data.forEach((item) => {
      cmpCmd += 'advanced-rest-client/' + item.element + ' ';
    });
    return this._ensureGroupExists(groupElement)
    .then(() => this._installGroupDeps(groupElement, cmpCmd))
    .then(() => this._updatePackageIndex(groupElement, data));
    // .catch((e) => {
    //   console.log(colors.red('\n[' + groupElement + ']' + e.message));
    //   throw e;
    // });
  }

  // Check if element has it's local repository in ../ path relative to the element's dir.
  _ensureGroupExists(groupElement) {
    return this._clone(groupElement);
  }
  /**
   * Check if directory (directories) exists.
   * @param {String...} dir Directory or list of directories (passed as arguments) to Check
   * @return {Promise} Promise will resolve when all directories exists and reject if at least one
   * of them does not exists.
   *
   * @example
   * this._dirExists('dir-one','dir-two').then(...).catch(...);
   */
  _dirExists(...dirs) {
    var promises = [];
    var testFn = function(directory) {
      return Promise((resolve, reject) => {
        fs.stat(directory, function(err, stats) {
          if (err) {
            return reject();
          }
          if (stats.isDirectory()) {
            return resolve();
          }
          reject();
        });
      });
    };
    dirs.forEach((dir) => promises.push(testFn(dir)));
    return Promise.all(promises);
  }
  /**
   * Install new packages if needed.
   * Bower will add them to the bower.json file.
   */
  _installGroupDeps(groupElement, dependency) {
    if (!groupElement) {
      throw new Error('groupElement is undefined.');
    }
    if (this.verbose) {
      console.log('  Installing group dependencies (adding to bower)', groupElement);
    }
    var dir = '';
    if (this.current) {
      dir = path.join(process.cwd(), '..', groupElement);
    } else {
      dir = groupElement;
    }
    return this._exec(`bower install --silent --save ${dependency}`, dir);
  }

  _updatePackageIndex(groupElement, data) {
    if (this.verbose) {
      console.log('  Updating group element imports', groupElement);
    }
    return this._readPackageIndex(groupElement)
    .then((r) => this._analyseIndex(r, data))
    .then((c) => this._writePackageIndex(groupElement, c))
    .then(() => {
      return groupElement;
    })
    .catch((err) => {
      console.log(colors.red('\n[' + groupElement + ']' + err.message));
    });
  }

  _readPackageIndex(groupElement) {
    if (this.verbose) {
      console.log('  Reading group element main file', groupElement);
    }
    return new Promise((resolve, reject) => {
      let file = [];
      if (this.current) {
        file = path.join('..', groupElement, groupElement + '.html');
      } else {
        file = path.join(groupElement, groupElement + '.html');
      }
      fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
          reject(new Error('Can\'t find file ' + file));
          return;
        }
        resolve(data);
      });
    });
  }

  _writePackageIndex(groupElement, content) {
    if (this.verbose) {
      console.log('  Writting group element main file', groupElement);
    }
    return new Promise((resolve, reject) => {
      let file = [];
      if (this.current) {
        file = path.join('..', groupElement, groupElement + '.html');
      } else {
        file = path.join(groupElement, groupElement + '.html');
      }
      fs.writeFile(file, content, (err) => {
        if (err) {
          reject(new Error('Can\'t write to file ' + file));
          return;
        }
        resolve();
      });
    });
  }

  _analyseIndex(html, elements) {
    if (this.verbose) {
      console.log('  Updating group element main file...');
    }
    var document = parse5.parse(html);
    var imports = [];
    var search = (item, node) => {
      if (item.nodeName === node) {
        return item;
      }
    };
    var searchAttr = (item, name) => {
      if (item.name === name) {
        return item;
      }
    };
    var htmlNode = document.childNodes.find((item) => search(item, 'html'));
    var head = htmlNode.childNodes.find((item) => search(item, 'head'));
    head.childNodes.forEach((node) => {
      if (node.nodeName === 'link') {
        let rel = node.attrs.find((item) => searchAttr(item, 'rel'));
        if (rel && rel.value === 'import') {
          let href = node.attrs.find((item) => searchAttr(item, 'href'));
          if (href) {
            imports.push(href.value);
          }
        }
      }
    });
    // console.log(imports, elements);
    var toAdd = this._markMissingImports(imports, elements);
    var adapter = parse5.treeAdapters.default;
    var nodes = [];
    toAdd.forEach((url) => nodes.push(this._createImportNode(adapter, url)));
    nodes.forEach((node) => {
      adapter.appendChild(head, node);
      adapter.insertText(head, '\n');
    });
    return parse5.serialize(document);
  }

  _markMissingImports(existingImports, requiredImports) {
    if (this.verbose) {
      console.log('  Searching for missing imports...');
    }
    var missing = [];
    var search = (existing, required) => {
      if (existing.indexOf(required) !== -1) {
        return existing;
      }
    };
    requiredImports.forEach((item) => {
      let path = item.element + '/' + item.main;
      let found = existingImports.find((e) => search(e, path));
      if (!found) {
        missing.push(path);
      }
    });
    return missing;
  }

  _createImportNode(adapter, href) {
    var attrs = [{
      'name': 'rel',
      'value': 'import'
    }, {
      'name': 'href',
      'value': '../' + href
    }];
    return adapter.createElement('link', 'http://www.w3.org/1999/xhtml', attrs);
  }

  _publish(groupElements) {
    if (this.verbose) {
      console.log('  Publishing elements...');
    }
    var promises = [];
    groupElements.forEach((item) => promises.push(this._publishElement(item)));
    return Promise.all(promises)
    .catch((err) => {
      console.log(colors.red('\n' + err.message));
    });
  }

  _publishElement(groupElement) {
    if (this.verbose) {
      console.log('  Publishing element ' + groupElement + '...');
    }

    var dir = '';
    if (this.current) {
      dir = path.join(process.cwd(), '..', groupElement);
    } else {
      dir = groupElement;
    }
    return this._exec('git status', dir)
    .then((out) => {
      if (out.indexOf('nothing to commit') !== -1) {
        throw new Error('nothing to commit');
      }
      return Promise.resolve();
    })
    .then(() => this._exec('git add -A', dir))
    .then(() => this._exec('git commit -m "New: [CI] Added new elements."', dir))
    .then(() => this._exec('gulp release', dir))
    .catch((err) => {
      if (err.message === 'nothing to commit') {
        // nothing happens
        return;
      }
      throw err;
    });
  }

  _clone(element) {
    if (this.verbose) {
      console.log('  Cloning ' + element + '...');
    }
    return new Promise((resolve, reject) => {
      let opts = {
        ssh: true,
        all: false,
        quiet: true
      };
      opts.components = [element];
      let clone = require('./arc-clone');
      try {
        const script = new clone.ArcClone(opts);
        script.run().then(resolve).catch(reject);
      } catch (e) {
        console.log(colors.red('  ' + e.message));
        reject();
      }
    });
  }

  _exec(cmd, dir) {
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
          // console.log(err);
          let currentDir = process.cwd();
          if (opts.cwd) {
            currentDir += '/' + opts.cwd;
          }
          reject(new Error('Unable to execute command: ' + err.message +
            '. Was in dir: ' + currentDir + '. stdout: ', stdout, '. stderr: ', stderr));
          return;
        }
        resolve(stdout);
      });
    });
  }
}
exports.ArcStructure = ArcStructure;
