'use strict';

const AuthClient = require('./auth-client.js').AuthClient;
const fs = require('fs');
const https = require('https');

/**
 * Chrome Web Store uploader.
 */
class Uploader {

  constructor(opts) {
    this.credentials = opts.credentials;
  }

  get scopes() {
    return ['https://www.googleapis.com/auth/chromewebstore'];
  }

  get config() {
    if (!this._config) {
      this._config = JSON.parse(fs.readFileSync('.cws-config.json', 'utf-8'));
    }
    return this._config;
  }

  auth() {
    if (this.token) {
      return Promise.resolve(this.token);
    }
    let opts = {
      credentials: this.credentials
    };
    var client = new AuthClient(opts);
    return client
      .execute(this.scopes)
      .then((ok) => {
        if (!ok) {
          throw new Error('User not authenticated');
        }
        //jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        this.token = client.oAuth2Client.credentials.access_token;
        //jscs:enable requireCamelCaseOrUpperCaseIdentifiers
        return this.token;
      });
  }

  /**
   * Upload (update) an item to Chrome Web Store.
   * Call `this.auth()` before calling this function.
   *
   * @param {String} file Path of the file to upload
   * @param {String} target Build target (canary, dev, beta, stable)
   */
  uploadItem(file, target) {
    var config = this.config;

    if (target in config) {
      let id = config[target].id;
      let buffer = fs.readFileSync(file);
      return this.auth()
      .then(() => this._uploadItem(buffer, id))
      .then((result) => {
        result = JSON.parse(result);
        if (result.uploadState === 'SUCCESS') {
          console.log('The item has been uploaded.');
        } else {
          throw new Error('Error uploading item to Chrome Web Store. ' + JSON.stringify(result));
        }
      });
    } else {
      return Promise.reject(new Error(`${target} is invalid target.`));
    }
  }

  _uploadItem(buffer, id) {
    return new Promise((resolve, reject) => {
      let options = {
        host: 'www.googleapis.com',
        path: `/upload/chromewebstore/v1.1/items/${id}`, //?key=${this.apiKey}
        port: '443',
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer ' + this.token,
          'Content-Type': 'application/zip',
          'Accept': '*/*',
          'Content-Length': buffer.length + '',
          'x-goog-api-version': '2'
        }
      };
      let req = https.request(options, (response) => {
        let str = '';
        response.on('data', function(chunk) {
          str += chunk;
        });
        response.on('end', function() {
          // console.log('CWS response', str);
          resolve(str);
        });
      });
      req.write(buffer);
      req.end();
      req.on('error', (e) => {
        console.error('CWS upload request error', e);
        reject(e);
      });
    });
  }
  /**
   * Publish a not published item in the CWS.
   */
  publishTarget(target, audience) {
    var config = this.config;
    if (target in config) {
      let id = config[target].id;
      let publishTo;
      if (audience) {
        switch (audience) {
          case 'all': publishTo = 'default'; break;
          case 'testers': publishTo = 'trustedTesters'; break;
        }
      } else {
        publishTo = config[target].publishTo;
      }
      if (!publishTo) {
        return Promise.reject(new Error(`Audience "${publishTo}" is invalid.`));
      }
      return this.auth().then(() => this._publishItem(id, publishTo));
    } else {
      return Promise.reject(new Error(`${target} is invalid target.`));
    }
  }
  /**
   * Publish an item in Chrome Web Store.
   * Call `this.auth()` before calling this function.
   *
   * @param {String} id Chrome Web Store item ID
   * @param {String?} audience Target audience to publish to. Possible values are 'default'
   * or 'trustedTesters'. Default to 'default'.
   */
  _publishItem(id, audience) {
    if (!audience) {
      return Promise.reject(new Error('The audience parameter is required.'));
    }
    if (['default', 'trustedTesters'].indexOf(audience) === -1) {
      return Promise.reject(new Error(`The "${audience}" is not valid value for the audience.`));
    }
    console.log('Publishing an item: %s for audience: %s', id, audience);
    return new Promise((resolve, reject) => {
      let options = {
        host: 'www.googleapis.com',
        path: `/chromewebstore/v1.1/items/${id}/publish?publishTarget=${audience}`,
        port: '443',
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + this.token,
          'Accept': '*/*',
          'x-goog-api-version': '2'
        }
      };
      let req = https.request(options, (response) => {
        let str = '';
        response.on('data', function(chunk) {
          str += chunk;
        });
        response.on('end', function() {
          str = JSON.parse(str);
          if (str.error) {
            let message;
            if (str.error.code) {
              message = 'Server error: ' + str.error.code + ' - ' + str.error.message;
            } else if (str.error.errors) {
              message = str.error.errors[0].message;
            } else {
              message = 'Unknown error ocurred.';
            }
            console.error(message);
            reject(message);
            return;
          }
          console.log('The item is now published.');
          resolve(str);
        });
      });
      req.end();
      req.on('error', (e) => {
        console.error('CWS publish request error', e);
        reject(e);
      });
    });
  }
}
module.exports.Uploader = Uploader;
