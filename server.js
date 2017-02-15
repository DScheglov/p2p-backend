'use strict';

const express = require('express');
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const path = require('path');

const app = express();
const config = require('./config');
const log = require("./lib/logger")(module);
const instHeader = require('./lib/institution-header');
const db = require("./models/index").db;
const modelAPI = require('./api');

app.use(require('./lib/logger')(module, true));
app.use(bodyParser.json());
app.use(methodOverride('X-HTTP-Method-Override')); // поддержка put и delete
app.use('/api/v1', instHeader, modelAPI);

app.use(function(req, res, next){
  res.status(404);
  log.debug('Not found URL: %s',req.url);
  res.send({ error: 'Not found' });
  return;
});

app.use(function(err, req, res, next){
  res.status(err.status || 500);
  log.error('Internal error(%d): %s',res.statusCode,err.message);
  res.send({ error: err.message });
  return;
});

app.listen(config.port, function() {
  console.log(`Express server listening on port ${config.port}`);
});
