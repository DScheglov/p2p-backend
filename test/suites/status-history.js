var async = require("async");
var assert = require('assert');
var mongoose = require('mongoose'); //require('../../lib/schema-ondo');
var Schema = mongoose.Schema;
var statusHistory = require("../../models/plugins/status-history");

describe("plugins::status-history", function (done) {

  before(function (done) {
    var dbName = "temp_db_"+mongoose.Types.ObjectId().toString();
    mongoose.connect('mongodb://localhost/'+dbName);
    var aSchema = new Schema({
      x: Number
    });
    aSchema.plugin(statusHistory);
    var aModel = mongoose.model("aModel", aSchema);
    var instance = new aModel({x: 1});
    instance.save(done);
  });

  it("should add fields: status, statusDate, statusHistory", function(done) {
    var model = mongoose.model("aModel");
    assert.ok(model, "Model was not created");
    var fields = Object.keys(model.schema.tree);
    // fields should be:
    // [ 'x', '_id', 'id', 'status', '__prevStatus',
    //   'statusDate', 'statusHistory', '__v' ]
    assert.equal(fields.length, 8);
    assert.ok(model.schema.tree.status);
    assert.ok(model.schema.tree.statusDate);
    assert.ok(model.schema.tree.statusHistory);
    done();
  });

  it("should create instance with default status and assign statusDate", function(done){
    var model = mongoose.model("aModel");
    assert.ok(model, "Model was not created");
    var instance = new model({x: 2});
    var ts1 = new Date();
    instance.save(function (err, _self) {
      var ts2 = new Date();
      assert.ok(!err, "Error occured: "+(err&&err.message));
      assert.equal(_self, instance);
      assert.equal(_self.status, statusHistory.statuses[0]);
      assert.ok(_self.statusDate.getTime() >= ts1);
      assert.ok(_self.statusDate.getTime() <= ts2);
      assert.equal(_self.statusHistory.length, 0);
      done();
    });
  });

  it("shouldn't save a history record if status of instance was not modified", function(done){
    var model = mongoose.model("aModel");
    assert.ok(model, "Model was not created");
    var prevStatusDate = null;
    var prevStatus = null;
    var inst = new model({x:3});
    var ts1 = (new Date()).getTime();
    var ts2;
    async.waterfall([
      inst.save.bind(inst),
      function (_self, cnt, next) {
        ts2 = (new Date()).getTime();
        _self.x = 7;
        return _self.save(next)
      }
    ], function(err, _self) {
      assert.ok(!err, "Error occured: "+(err&&err.message));
      assert.equal(_self.status, statusHistory.statuses[0]);
      assert.ok(_self.statusDate.getTime() >= ts1);
      assert.ok(_self.statusDate.getTime() <= ts2);
      assert.equal(_self.statusHistory.length, 0);
      done();
    });

  });

  it("should save a history record if status of instance was modified", function(done){
    var model = mongoose.model("aModel");
    assert.ok(model, "Model was not created");
    var prevStatusDate = null;
    var prevStatus = null;
    async.waterfall([
      model.findOne.bind(model, {x:1}),
      function (_self, next) {
        prevStatusDate = _self.statusDate;
        prevStatus = _self.status;
        return next(null, _self);
      },
      function (_self, next) {
        _self.status = statusHistory.statuses[1];
        return _self.save(next)
      }
    ], function(err, _self) {
      var ts2 = new Date();
      assert.ok(!err, "Error occured: "+(err&&err.message));
      assert.equal(_self.status, statusHistory.statuses[1]);
      assert.ok(_self.statusDate.getTime() <= ts2);
      assert.equal(_self.statusHistory.length, 1);
      var historyRecord = _self.statusHistory[0];
      assert.equal(historyRecord.status, prevStatus);
      assert.equal(historyRecord.from.getTime(), prevStatusDate.getTime());
      assert.equal(historyRecord.to.getTime(), _self.statusDate.getTime());
      done();
    });

  });

  after(function (done) {
    mongoose.connection.db.dropDatabase();
    mongoose.connection.close(done);
  });
})
