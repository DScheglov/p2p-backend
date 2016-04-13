var mongoose = require('mongoose'); require('./lib/schema-ondo');
var Schema = mongoose.Schema;
var xSchema = new Schema({
  x: Number
});

xSchema.path('x').set(function (v) {
  if (v === 0) this.emitAsync("x===0", this, v, function(err) {
    console.log(err&&err.message || "All handlers processed");
  });
  console.log("x = %s", v);
  return v;
})

var xySchema = new Schema({
  y: Number
});

xySchema.ondo('x===0', function (v, next) {
  console.dir(arguments);
  console.log("Current value of x is <%s> and then it will be <%s>", this.x, v);
  next();
});

var xModel = mongoose.model('xModel', xSchema);
var xyModel = xModel.discriminator('xyModel', xySchema);

var X = new xModel({x:2});
var XY = new xyModel({x: 2, y: 3});

X.x = 3;
X.x = 0;
XY.x = 5;
XY.x = 0;
XY.x = 7;
