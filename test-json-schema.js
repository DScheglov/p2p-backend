var mongoose = require('mongoose-schema-jsonschema')(require('./mongoose'));

var C = require('./models/contracts').Contract;

var jS = C.jsonSchema();

console.dir(jS, {depth: null});
