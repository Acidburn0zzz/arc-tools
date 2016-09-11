'use strict';
const fs = require('fs');
const colors = require('colors/safe');
const Spinner = require('cli-spinner').Spinner;
const hyd = require('hydrolysis');

class ArcDocs {
  constructor(opts) {
    this.all = opts.all || false;
    this.verbose = opts.verbose || false;

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
    return this._listComponents()
    .then((result) => this._clearComponentsList(result))
    .then((result) => this._generateDocs(result))
    .then((result) => this._writeDocs(result))
    .then((result) => {
      this.spinner.stop(true);
      result.forEach((item) => {
        if (item.error) {
          console.error(item.error);
        }
      });
    });
  }

  _listComponents() {
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
            file: file,
            error: true,
            message: 'No bower.json file.'
          });
          return;
        }
        data = JSON.parse(data);
        if (!data.main) {
          resolve({
            file: file,
            error: true,
            message: 'No "main" entry in the bower.json file.'
          });
          return;
        }

        resolve({
          file: file,
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
          console.log(colors.yellow(`[${item.file}]: ${item.message}`));
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
      // console.log(analyzer);
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
    this.spinner.stop(true);
    this.spinner.setSpinnerTitle('Generating docs.');
    this.spinner.start();
    var p = [];
    list.forEach((item) => p.push(this._generateDoc(item)));
    return Promise.all(p);
  }

  _generateDoc(item) {
    var main = item.main;
    if (main instanceof Array && main.length === 1) {
      main = main[0];
    }
    if (typeof main === 'string') {
      let cmp = main.substr(0, main.lastIndexOf('.'));
      let file = item.file + '/' + main;
      return this._analyse(file, cmp)
        .then((info) => {
          item.info = info;
          return item;
        });
    } else if (main instanceof Array) {
      var p = [];
      main.forEach((entry) => {
        let cmp = entry.substr(0, entry.lastIndexOf('.'));
        let file = item.file + '/' + entry;
        p.push(this._analyse(file, cmp));
      });
      return Promise.all(p).then((info) => {
        item.info = info;
        return item;
      });
    }
  }

  _writeDocs(list) {
    this.spinner.stop(true);
    this.spinner.setSpinnerTitle('Writting docs.');
    this.spinner.start();
    var p = [];
    list.forEach((item) => {
      if (!item.info) {
        // console.log('Dropping ' + item.file);
        return;
      }
      // console.log('Preparing content for ' + item.file);
      try {
        let content = this._prepareContent(item.info);
        if (!content) {
          return;
        }
        let file = item.file + '/README.md';
        p.push(this._writeDocsFile(file, content));
      } catch (e) {
        console.log(e);
      }
    });
    return Promise.all(p);
  }

  _prepareContent(info) {
    var txt = '';
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
        // console.log(ev);
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
    // console.log(info.events);
    // console.log(info.properties);

    return txt;
  }

  _writeDocsFile(file, content) {
    // console.log('_writeDocsFile', file, content);
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
}
exports.ArcDocs = ArcDocs;
