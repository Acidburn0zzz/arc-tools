'use strict';

const google = require('googleapis');
const OAuth2Client = google.auth.OAuth2;
const http = require('http');
const url = require('url');
const querystring = require('querystring');
const openBrowser = require('open');
const fs = require('fs');

function AuthClient(options) {
  var self = this;
  self.isAuthenticated = false;
  this._options = options || {};
  var secrets;
  try {
    secrets = JSON.parse(fs.readFileSync(this._options.credentials, 'utf-8'));
  } catch (e) {
    console.log(`Starting directory: ${process.cwd()}`);
    console.error('The credentials file not found. ', this._options.credentials);
    console.error('You won\'t be able to publish the app. ');
    self.execute = function() {
      return Promise.reject(new Error(self._options.credentials + ' file not found.'));
    };
    return;
  }
  this.oAuth2Client = new OAuth2Client(
    secrets.web.clientId,
    secrets.web.clientSecret,
    secrets.web.redirectUris[0]);
  this._authenticate = function(scopes, callback) {
    // console.log('Calling _authenticate');
    self.authorizeUrl = self.oAuth2Client.generateAuthUrl({
      //jscs:disable requireCamelCaseOrUpperCaseIdentifiers
      access_type: 'offline',
      //jscs:enable requireCamelCaseOrUpperCaseIdentifiers
      scope: scopes.join(' ')
    });
    // console.log(self.authorizeUrl);
    var server = http.createServer(function(request, response) {
      var qs = querystring.parse(url.parse(request.url).query);
      if (!qs.code) {
        server.close();
        return;
      }
      self.oAuth2Client.getToken(qs.code, function(err, tokens) {
        if (err) {
          console.error('Error getting oAuth tokens: ' + err);
          response.end('Error getting oAuth tokens: ' + err);
          self.isAuthenticated = false;
        } else {
          self.oAuth2Client.setCredentials(tokens);
          self.isAuthenticated = true;
          response.end('Authentication successful! Close tab and return to the console.');
        }
        server.close();
        callback();
      });
    }).listen(8080, function() {
      console.log('Close browser tab after authentication to continue.');
      openBrowser(self.authorizeUrl);
    });
  };

  self.execute = function(scopes) {
    if (self.isAuthenticated) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      self._authenticate(scopes, () => {
        resolve(self.isAuthenticated);
      });
    });
  };

  return self;
}

module.exports.AuthClient = AuthClient;
