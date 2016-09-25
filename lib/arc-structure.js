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
    'har', 'arc-element-catalog'];
    return list.concat(this.elementsParents);
  }

  constructor(opts) {
    this.all = opts.all || false;
    this.verbose = opts.verbose || false;
    this.release = opts.release || false;

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

    this.spinner = new Spinner('Processing...');
    this.spinner.setSpinnerString(18);
    this.spinner.start();
  }

  run() {
    return this._listComponents()
    .then((r) => this._clearComponentsList(r))
    .then((r) => this._generateStructure(r))
    .then((r) => this._organizeStructure(r))
    .then((r) => this._updateGroups(r))
    .then((arr) => {
      if (this.release) {
        return this._publish(arr);
      }
    })
    .then(() => {
      this.spinner.stop(true);
    });
  }

  _listComponents() {
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
    this.spinner.stop(true);
    this.spinner.setSpinnerTitle('Getting structure information.');
    this.spinner.start();
    var p = [];
    list.forEach((item) => {
      p.push(this._readStructureInfo(item));
    });
    return Promise.all(p);
  }

  _readStructureInfo(item) {
    this.spinner.stop(true);
    this.spinner.setSpinnerTitle('Analysing component.');
    this.spinner.start();

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
    .then(function(analyzer) {
      // console.log(analyzer);
      if (!analyzer || !analyzer.elementsByTagName || !analyzer.elementsByTagName[item.element]) {
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
    this.spinner.stop(true);
    this.spinner.setSpinnerTitle('Updating structure info.');
    this.spinner.start();

    var promises = [];
    for (let groupElement in groups) {
      let data = groups[groupElement];
      let element = groupElement.replace(/\s/g, '-');
      promises.push(this._updateGroup(element, data));
    }
    return Promise.all(promises);
  }

  _updateGroup(groupElement, data) {
    var cmpCmd = '';
    data.forEach((item) => {
      cmpCmd += 'advanced-rest-client/' + item.element + ' ';
    });
    return this._installGroupDeps(groupElement, cmpCmd)
    .then(() => this._updatePackageIndex(groupElement, data))
    .catch((e) => {
      console.log(colors.red('\n[' + groupElement + ']' + e.message));
    });
  }

  _installGroupDeps(groupElement, dependency) {
    var cmd = '';
    if (!this.current) {
      cmd += `cd ${groupElement} && `;
    }
    cmd += `bower install --save ${dependency}`;
    return new Promise((resolve, reject) => {
      exec(cmd, (err, out) => {
        if (err) {
          reject(err);
          return;
        }
        if (this.verbose) {
          console.log(out);
        }
        resolve(true);
      });
    });
  }

  _updatePackageIndex(groupElement, data) {
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
    var promises = [];
    groupElements.forEach((item) => promises.push(this._publishElement(item)));
    return Promise.all(promises)
    .catch((err) => {
      console.log(colors.red('\n' + err.message));
    });
  }

  _publishElement(groupElement) {
    var cmd = '';
    if (!this.current) {
      cmd += `cd ${groupElement} && `;
    }
    cmd += 'git add -A && ';
    cmd += 'git commit -m "New: Added new elements. Automated release." && ';
    // cmd += 'git push origin master ';
    cmd += 'gulp release ';
    return new Promise((resolve, reject) => {
      exec(cmd, (err, out) => {
        if (err) {
          reject(err);
          return;
        }
        if (this.verbose) {
          console.log(out);
        }
        resolve();
      });
    });
  }
}
exports.ArcStructure = ArcStructure;
