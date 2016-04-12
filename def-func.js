var async = require("async");
var assert = require("assert");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var aType = new Schema({
  s: String,
  l: {type: Number, default: getLength}
});

function getLength() {
  if (!this._doc) return;
  return this.s && this.s.length || 0;
}

aType.pre("validate", function (next) {
  console.log("pre validate");
  var paths = Object.keys(this.schema.paths);
  var i=0;
  for (;i<paths.length;i++) {
    var p = paths[i];
    if (typeof(this.get(p)) == 'undefined') {
      console.log("Defaulting [%s]", p);
      this.set(p, this.schema.paths[p].getDefault(this));
    }
  }
  next();
});

var aModel = mongoose.model("aModel", aType);

var dbName = "temp_db_" + mongoose.Types.ObjectId().toString();
mongoose.connect('mongodb://localhost/'+dbName);

var s1 = new aModel();
var s2 = new aModel({s: "ABC"});

async.series([
  s1.save.bind(s1),
  s2.save.bind(s2)
], function(err) {
  console.dir(s1.toJSON());
  console.dir(s2.toJSON());
  mongoose.connection.db.dropDatabase();
  mongoose.connection.close();
});
