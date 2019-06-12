const compression = require('compression');
const express = require('express');
const fs = require('fs');
const https = require('https');
const prpl = require('prpl-server');

const config = require('./build/polymer.json');

const app = express();

let pemPath;
let secure;
let tlsOptions;

switch (process.env.NODE_ENV) {
  case 'staging':
    pemPath = '/etc/letsencrypt/live/example.com';
    secure = true;
    break;
  case 'production':
    pemPath = '/etc/letsencrypt/live/example.com';
    secure = true;
    break;
  case 'local':
    pemPath = './resources/certificates/live/localhost.example.com';
    secure = true;
    break;
  default:
    secure = false;
    break;
}

if (secure) {
  tlsOptions = {
    cert: fs.readFileSync(`${pemPath}/fullchain.pem`),
    key: fs.readFileSync(`${pemPath}/privkey.pem`),
  };
}

app.set('trust proxy', true);

app.use(compression());

app.use(express.static('static', {dotfiles: 'allow'}));

if (secure) {
  app.use((req, res, next) => {
    if (req.secure) {
      next();
      return;
    }

    res.redirect(301, `https://${req.hostname}${req.url}`);
  });
}

app.get('/*', prpl.makeHandler('./build/', config));

app.listen(80);

if (secure) {
  https.createServer(tlsOptions, app).listen(443);
}

const env =
  process.env.NODE_ENV === undefined ? 'development' : process.env.NODE_ENV;

console.log(`\nSS Simple Front-end\n`);
console.log(`Environment: ${env}`);
console.log(`\n${new Date().toString()}\n`);
