
var async = require("async")
var assert = require('assert');
var mongoose = require('mongoose');
var Institution = require('../../models/institutions').Institution;
var Entity = require('../../models/entities').Entity;
var ProductPolicy = require('../../models/accounting-policies').AccountingProductPolicy;
var Product = require('../../models/products').Product;
var Contract = require('../../models/contracts').Contract;
var Account = require('../../models/accounts').Account;
var AccountFactory = require('../../models/account-factories').AccountFactory;

var fixtures = {
  institutions: require('../fixtures/institutions'),
  entities: require('../fixtures/entities'),
  factories: require('../fixtures/factories'),
  accounts: require('../fixtures/accounts'),
  policies: require('../fixtures/product-policies'),
  products: require('../fixtures/products'),
  contracts: require('../fixtures/contracts')
}

describe("models.Contract", function () {

  before(function (done) {
    var dbName = "temp_db_" + mongoose.Types.ObjectId().toString();
    mongoose.connect('mongodb://localhost/'+dbName);
    var iCollection = Institution.collection;
    var cCollection = Contract.collection;
    var eCollection = Entity.collection;
    var pCollection = ProductPolicy.collection;
    var prCollection= Product.collection;
    var aCollection = Account.collection;
    var afCollection = AccountFactory.collection;
    async.series([
      iCollection.insert.bind(iCollection, fixtures.institutions),
      eCollection.insert.bind(eCollection, fixtures.entities),
      pCollection.insert.bind(pCollection, fixtures.policies),
      afCollection.insert.bind(afCollection, fixtures.factories),
      prCollection.insert.bind(prCollection, fixtures.products),
      aCollection.insert.bind(aCollection, fixtures.accounts),
      cCollection.insert.bind(cCollection, fixtures.contracts)
    ], function (err) {
      AccountFactory.update({}, {
        $set: {sequence: fixtures.accounts.length + 1}
      }, {multi: true}, done);
    });
  });

  it("should be created", function(done) {
    var c = new Contract({
      institution: fixtures.institutions[0]._id,
      owner: fixtures.entities[0]._id,
      productCode: fixtures.products[0].code
    });
    c.save(function(err, _self) {
      assert.ok(!err, "Error occured: " + (err&&err.message));
      assert.ok(_self);
      assert.equal(c, _self);
      assert.ok(c.accounts.gateway);
      done();
    });
  });

  it("should fail if product Code assigned incorrectly", function(done) {
    var c = new Contract({
      institution: fixtures.institutions[0]._id,
      owner: fixtures.entities[0]._id,
      productCode: "WRONG.CODE: " + fixtures.products[0].code
    });
    c.save(function(err, _self) {
      assert.ok(err);
      assert.ok(!_self);
      assert.equal(err.message, "Product was not found.");
      done();
    });
  });

  it("should be activated if settlementDayOfMonth is assigned", function(done) {
    var c = new Contract({
      institution: fixtures.institutions[0]._id,
      owner: fixtures.entities[0]._id,
      productCode: fixtures.products[0].code,
      acitve: "new",
    });
    async.waterfall([
      c.save.bind(c),
      function () {
        var next = arguments[arguments.length - 1];
        c.settlementDayOfMonth = "10";
        c.status = "active";
        c.save(next)
      }
    ], function (err, _c) {
      assert.ok(!err, "Error occured: " + (err&&err.message));
      assert.ok(_c);
      assert.equal(c, _c);
      assert.ok(_c.settlementPeriod);
      assert.ok(_c.settlementPeriod.start);
      assert.ok(_c.settlementPeriod.end);
      done();
    });
  });

  it("should provide void settlement at closeOperatingDate event for contracts", function(done) {

    Contract.closeOperatingDate({
        operatingDate : fixtures.institutions[0].operatingDate,
        institution: fixtures.institutions[0]
    }, function(err, results) {
      assert.ok(!err, "Error occured: " + (err&&err.message));
      assert.ok(results);
      assert.equal(results.contracts, fixtures.contracts.length + 1);
      done();
    });
  });

  it("should fail to provide void settlement at closeOperatingDate if options is not assigned", function(done) {
    Contract.closeOperatingDate({
    }, function(err, results) {
      assert.ok(err);
      assert.ok(!results);
      assert.equal(err.message, "You should specify closing operatingDate");
      done();
    });
  });

  it("should provide void settlement at openOperatingDate event for contracts", function(done) {
    Contract.openOperatingDate({
      operatingDate : fixtures.institutions[0].operatingDate,
      institution: fixtures.institutions[0]
    }, function(err, results) {
      assert.ok(!err, "Error occured: " + (err&&err.message));
      assert.ok(results);
      assert.equal(results.contracts, fixtures.contracts.length + 1);
      done();
    });
  });

  it("should fail to provide void settlement at openOperatingDate if options is not assigned", function(done) {
    Contract.openOperatingDate({
    }, function(err, results) {
      assert.ok(err);
      assert.ok(!results);
      assert.equal(err.message, "You should specify opening operatingDate");
      done();
    });
  });

  after(function (done) {
    mongoose.connection.db.dropDatabase();
    mongoose.connection.close(done);
  });

});
