'use strict';
const fs = require('fs');
const colors = require('colors/safe');
const hyd = require('hydrolysis');
const ArcBase = require('./arc-base').ArcBase;

class ArcDocs extends ArcBase {
  constructor(opts) {
    super(opts);

    this.all = opts.all || false;

    if (!this.all && !(opts.components && opts.components.length)) {
      this.current = true;
    } else {
      this.current = false;
    }
    if (this.all && opts.components && opts.components.length) {
      throw new Error('You can\'t set --all and list of components together.');
    }

    if (!this.all && !this.current) {
      this.components = opts.components;
    }
  }

  run() {
    return this._listComponents()
    .then((result) => this._clearComponentsList(result))
    .then((result) => this._generateDocs(result))
    .then((result) => this._writeDocs(result))
    .then((result) => {
      result.forEach((item) => {
        if (item.error) {
          console.error(item.error);
        }
      });
    });
  }

  _listComponents() {
    if (this.current) {
      return this._processFileEntry('.').then((res) => [res]);
    }
    if (!this.all) {
      let p = [];
      this.components.forEach((file) => p.push(this._processFileEntry(file)));
      return Promise.all(p);
    }
    return new Promise((resolve, reject) => {
      fs.readdir('./', (err, files) => {
        if (err) {
          reject(err);
          return;
        }
        let p = [];
        files.forEach((file) => p.push(this._processFileEntry(file)));
        Promise.all(p).then(resolve).catch(reject);
      });
    });
  }

  _processFileEntry(file) {
    return new Promise((resolve) => {
      // it should contain a file + '/bower.json' file. If not it is not a component file.
      let bowerFile = file + '/bower.json';
      fs.readFile(bowerFile, 'utf8', (err, data) => {
        if (err) {
          resolve({
            dir: file,
            error: true,
            message: 'No bower.json file.'
          });
          return;
        }
        data = JSON.parse(data);
        if (!data.main) {
          resolve({
            dir: file,
            error: true,
            message: 'No "main" entry in the bower.json file.'
          });
          return;
        }
        resolve({
          dir: file,
          error: false,
          main: data.main
        });
      });
    });
  }

  _clearComponentsList(list) {
    list = list.filter((item) => {
      if (item.error) {
        if (this.verbose) {
          console.log(colors.yellow(`[${item.dir}]: ${item.message}`));
        }
        return false;
      }
      return true;
    });
    list = list.map((item) => {
      delete item.error;
      return item;
    });
    return list;
  }

  _analyse(file, cmp) {
    return hyd.Analyzer.analyze(file)
    .then(function(analyzer) {
      if (!analyzer || !analyzer.elementsByTagName || !analyzer.elementsByTagName[cmp]) {
        return false;
      }
      let elm = analyzer.elementsByTagName[cmp];
      return {
        desc: elm.desc,
        events: elm.events,
        properties: elm.properties,
        cmp: cmp
      };
    });
  }

  _generateDocs(list) {
    var p = [];
    list.forEach((item) => p.push(this._generateDoc(item)));
    return Promise.all(p);
  }

  _generateDoc(item) {
    var main = item.main;
    if (main instanceof Array && main.length === 1) {
      main = main[0];
    }
    var promises = [];
    if (typeof main === 'string') {
      promises.push(this._genDocForEntry(item.dir, main));
    } else if (main instanceof Array) {
      promises = main.map((entry) => {
        return this._genDocForEntry(item.dir, entry);
      });
    }
    return Promise.all(promises)
    .then((info) => {
      item.info = info;
    })
    .then(() => this._checkBadges(item.dir))
    .then((badges) => {
      item.badges = badges;
      return item;
    });
  }

  _genDocForEntry(dir, main) {
    let cmp = main.substr(0, main.lastIndexOf('.'));
    let file = dir + '/' + main;
    return this._analyse(file, cmp);
  }

  _writeDocs(list) {
    var p = [];
    list.forEach((item) => {
      if (!item.info) {
        return;
      }
      try {
        let content = this._prepareContent(item.dir, item.info, item.badges);
        if (!content) {
          return;
        }
        let file = item.dir + '/README.md';
        p.push(this._writeDocsFile(file, content));
      } catch (e) {
        console.log(e);
      }
    });
    return Promise.all(p);
  }

  _prepareContent(cmpName, info, badges) {
    var txt = '';
    if (badges.travis) {
      txt += '[![Build Status](https://travis-ci.org/advanced-rest-client/' +
        `${cmpName}.svg?branch=master)](https://travis-ci.org/advanced-rest-client/${cmpName})  `;
    }
    if (badges.dependencyci) {
      txt += '[![Dependency Status](https://dependencyci.com/github/advanced-rest-client/' +
        `${cmpName}/badge)](https://dependencyci.com/github/advanced-rest-client/${cmpName})  `;
    }
    if (txt) {
      txt += '\n\n';
    }
    if (info instanceof Array) {
      info.forEach((item) => {
        if (!item.cmp) {
          return;
        }
        txt += '# ' + item.cmp + '\n';
        txt += this._getContent(item);
      });
    } else {
      txt = this._getContent(info);
    }
    return txt;
  }

  _getContent(info) {
    var txt = info.desc;

    if (info.events && info.events.length > 0) {
      txt += '\n\n### Events\n';
      txt += '| Name | Description | Params |\n';
      txt += '| --- | --- | --- |\n';
      info.events.forEach((ev) => {
        let desc = ev.jsdoc.description;
        if (!desc) {
          desc = '';
        }
        desc = desc.trim();
        desc = desc.replace(/\n/gim, ' ');
        desc = desc.replace(/\|/gim, '&#124;');
        txt += `| ${ev.name} | ${desc} | `;
        if (ev.params && ev.params.length) {
          for (let i = 0, len = ev.params.length; i < len; i++) {
            let p = ev.params[i];
            let desc = p.desc;
            if (!desc) {
              desc = '';
            }
            desc = desc.trim();
            desc = desc.replace(/\n/gim, ' ');
            desc = desc.replace(/\|/gim, '&#124;');
            p.type = p.type || '';
            p.type = p.type.replace(/\|/gim, '&#124;');
            txt += `${p.name} **${p.type}** - ${desc} |\n`;
          }
        } else {
          txt += '__none__ |\n';
        }
      });
    }
    return txt;
  }

  _writeDocsFile(file, content) {
    return new Promise((resolve) => {
      fs.writeFile(file, content, (err) => {
        if (err) {
          resolve({
            error: err
          });
          return;
        }
        resolve(true);
      });
    });
  }

  _checkBadges(dir) {
    var noop = () => {};
    var options = {
      'travis': false,
      'dependencyci': false
    };
    return this.fileExists(dir + '/dependencyci.yml')
    .then(() => {
      options.dependencyci = true;
    }).catch(noop)
    .then(() => this.fileExists(dir + '/.travis.yml'))
    .then(() => {
      options.travis = true;
    }).catch(noop)
    .then(() => options);
  }
}
exports.ArcDocs = ArcDocs;
