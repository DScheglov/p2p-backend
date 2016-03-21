var express = require('express');
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var morgan = require("morgan");
var serveStatic = require('serve-static');
var path = require('path');


var app = express();
var log = require("./lib/logger")(module);
var instHeader = require('./lib/institution-header');
var db = require("./models/index").db;
var ModelAPI = require('./api')(app);

app.use(morgan('combined')); // выводим все запросы со статусами в консоль
app.use(bodyParser.json()); // стандартный модуль, для парсинга JSON в запросах
app.use(methodOverride('X-HTTP-Method-Override')); // поддержка put и delete
app.use("/api/v1", instHeader);
ModelAPI.implement();

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

app.listen(1337, function(){
  console.log('Express server listening on port 1337');
});
