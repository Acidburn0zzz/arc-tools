'use strict';
const path = require('path');
const fs = require('fs');
/**
 * The PolyMd module is a command line module to create polymer elements from a template.
 * It contains full directory structure with the helper files like .gitignore or .hintrc
 *
 * # Usage
 * polymd module-name [--description "the description"]
 *
 * Where `module-name` is a name of the web component.
 */
class PolyMd {

  constructor(name, options) {
    if (!name) {
      this.throwError('invalid-name', name);
      return;
    }
    if (/[a-zA-Z0-9\-]/.test(name) || name.indexOf('-') === -1) {
      name = name.toLowerCase();
      this.name = name;
    } else {
      this.throwError('invalid-name', name);
      return;
    }

    this.processArgs(options);
  }

  get author() {
    if (this.isArcComponent) {
      return 'The Advanced REST client authors';
    }
    return this._author || process.env.POLYMD_AUTHOR || process.env.USER || 'Add author here';
  }

  get repository() {
    if (this.isArcComponent) {
      return `advanced-rest-client/${this.name}`;
    }
    if (this._repository) {
      return this._repository + '/' + this.name;
    }
    if (process.env.POLYMD_REPO) {
      return process.env.POLYMD_REPO + this.name;
    }
    return 'YOUR-NAME/' + this.name;
  }

  processArgs(o) {
    if (o.skipTests) {
      this.skipTests = true;
    }
    if (o.skipDemo) {
      this.skipDemo = true;
    }
    if (o.debug) {
      this.isDebug = true;
    }
    if (o.description) {
      this.description = o.description;
    }
    if (o.author) {
      this._author = o.author;
    }
    if (o.version) {
      this.version = o.version;
    }
    if (o.repository) {
      this._repository = o.repository;
    }
    if (o.path) {
      this.target = o.path;
    } else {
      this.setTarget();
    }

    if (o.arc) {
      this.isArcComponent = true;
    }
  }

  throwError(type, param) {
    var message = '';

    switch (type) {
      case 'invalid-name':
        message += 'The name of the component is invalid: ' + param + '. \n';
        message += 'Only A-Z, a-z, 0-9 and `-` signs are allowed. The name must contain ';
        message += 'a `-` sign.';
      break;
    }

    throw new Error(message);
  }

  // Set target directory
  setTarget() {
    var dir = process.cwd();
    dir += '/' + this.name;
    if (this.isDebug) {
      dir += '/output';
    }
    this.target = dir;
  }

  selfPath(path) {
    return __dirname + '/' + path;
  }

  run() {
    if (!this.target) {
      throw new Error('Unknown target. Set argument first.');
    }
    // Copy helper files.
    this.copy(this.selfPath('templates/helpers'), path.join(this.target, './'));
    // Component's metadata and logic.
    this.copy(this.selfPath('templates/logic'), path.join(this.target, './'));
    this.copy(this.selfPath('templates/_package.json'), path.join(this.target, './package.json'));
    // Gulp tasks.
    this.copy(this.selfPath('templates/tasks'), path.join(this.target, './tasks'));
    // The Component
    this.copy(this.selfPath('templates/component.html'),
      path.join(this.target, `./${this.name}.html`));
    // Test cases.
    if (!this.skipTests) {
      this.copy(this.selfPath('templates/test'), path.join(this.target, './test'));
    }
    // Demo page.
    if (!this.skipDemo) {
      this.copy(this.selfPath('templates/demo'), path.join(this.target, './demo'));
    }
    this.updateVariables();
  }

  copy(src, dest) {
    var exists = fs.existsSync(src);
    if (!exists) {
      return false;
    }
    var stats = fs.statSync(src);
    if (stats.isFile()) {
      if (fs.existsSync(dest)) {
        let ds = fs.statSync(dest);
        if (ds.isDirectory()) {
          return;
        } else if (ds.isFile()) {
          fs.unlinkSync(dest);
        }
      }
      fs.writeFileSync(dest, fs.readFileSync(src));
      return true;
    } else if (stats.isDirectory()) {
      try {
        fs.mkdirSync(dest);
      } catch (e) {

      }
      fs.readdirSync(src).forEach((file) => {
        this.copy(path.join(src, file),
                        path.join(dest, file));
      });
    }
  }

  // Update variables in the copied files.
  updateVariables() {
    this._updateVars(path.join(this.target, './bower.json'));
    this._updateVars(path.join(this.target, './package.json'));
    this._updateVars(path.join(this.target, './README.md'));
    this._updateVars(path.join(this.target, `./${this.name}.html`));
    this._updateVars(path.join(this.target, './index.html'));
    // Test file.
    if (!this.skipTests) {
      this._updateVars(path.join(this.target, './test/basic-test.html'));
    }
    // Demo page.
    if (!this.skipDemo) {
      this._updateVars(path.join(this.target, './demo/index.html'));
    }
  }

  _updateVars(file) {
    var name = this.name;
    var author = this.author;
    var description = this.description || 'Insert description here.';
    var version = this.version || '1.0.0';
    var repository = this.repository;

    var txt = fs.readFileSync(file, 'utf8');
    txt = txt.replace(/ELEMENT-NAME/gim, name);
    txt = txt.replace(/ELEMENT-AUTHOR/gim, author);
    txt = txt.replace(/ELEMENT-DESCRIPTION/gim, description);
    txt = txt.replace(/ELEMENT-VERSION/gim, version);
    txt = txt.replace(/REPOSITORY-NAME/gim, repository);
    fs.writeFileSync(file, txt);
  }
}
exports.PolyMd = PolyMd;
