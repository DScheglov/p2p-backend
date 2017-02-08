var async = require("async")
var assert = require('assert');
var mongoose = require('../../mongoose')
var Institution = require('../../models/institutions').Institution;
var DailyBalance = require('../../models/daily-balances').DailyBalance;
var accounts = require('../../models/accounts');
var Account = accounts.Account;
var fixtures = {
  institutions: require('../fixtures/institutions')
}

describe("models.Account", function (done) {

  before(function(done) {
    var dbName = "temp_db_" + mongoose.Types.ObjectId().toString();
    mongoose.connect('mongodb://localhost/'+dbName);
    var iCollection = Institution.collection;
    async.series([
      iCollection.insert.bind(iCollection, fixtures.institutions),
    ], done);
  });

  it("should be created", function(done) {
    var A = new Account({
      "GLNumber" : "6000",
      "_id" : "001:ACCOUNT#1",
      "currency" : "EUR",
      "institution" : fixtures.institutions[0]._id,
      "owner" : null,
      "status" : "open",
      "title" : "The Incomes of the Institution",
      "type" : "Liability"
    });
    A.save(function(err, _self) {
      assert.ok(!err, "Error occured: "+(err&&err.message));
      assert.ok(_self);
      assert.equal(A, _self);
      done();
    });
  });

  it("shoold fail to create if any of required field was not specified", function(done) {
    var A = new Account();
    A.save(function(err, _self) {
      assert.ok(err);
      assert.ok(!_self);
      assert.ok(err.errors.institution);
      assert.ok(err.errors.currency);
      assert.ok(err.errors.type);
      assert.ok(err.errors.title);
      done();
    });
  });

  it("should define property =number=", function(done) {
    var A = new Account({
      "GLNumber" : "6000",
      "_id" : "001:ACCOUNT#2",
      "currency" : "EUR",
      "institution" : fixtures.institutions[0]._id,
      "owner" : null,
      "status" : "open",
      "title" : "The Incomes of the Institution",
      "type" : "Liability"
    });
    A.save(function(err, _self) {
      assert.ok(!err, "Error occured: "+(err&&err.message));
      assert.ok(_self);
      assert.equal(A, _self);
      assert.equal(_self.number, "001:ACCOUNT#2");
      done();
    });
  });

  it("should calculate property =balance= for Liability account", function(done) {
    var A = new Account({
      "GLNumber" : "6000",
      "_id" : "001:ACCOUNT#3",
      "currency" : "EUR",
      "institution" : fixtures.institutions[0]._id,
      "owner" : null,
      "status" : "open",
      "credit": 1000,
      "debit": 250,
      "title" : "The Incomes of the Institution",
      "type" : "Liability"
    });
    A.save(function(err, _self) {
      assert.ok(!err, "Error occured: "+(err&&err.message));
      assert.ok(_self);
      assert.equal(A, _self);
      assert.equal(A.debit, 250);
      assert.equal(A.credit, 1000);
      assert.equal(A.balance, 750);
      done();
    });
  });

  it("should calculate property =balance= for Assets account", function(done) {
    var A = new Account({
      "GLNumber" : "7000",
      "_id" : "001:ACCOUNT#4",
      "currency" : "EUR",
      "institution" : fixtures.institutions[0]._id,
      "owner" : null,
      "status" : "open",
      "credit": 250,
      "debit": 1000,
      "title" : "The Expenses of the Institution",
      "type" : "Assets"
    });
    A.save(function(err, _self) {
      assert.ok(!err, "Error occured: "+(err&&err.message));
      assert.ok(_self);
      assert.equal(A, _self);
      assert.equal(A.credit, 250);
      assert.equal(A.debit, 1000);
      assert.equal(A.balance, 750);
      done();
    });
  });

  it("should provide settlement at closeOperatingDate event for accounts", function(done) {
    var accounts = 0;
    var DailyBalance = mongoose.model("DailyBalance");
    async.waterfall([
      Account.count.bind(Account, {
        status: "open",
        institution: fixtures.institutions[0]._id
      }),
      function (count, next) {
        accounts = count;
        return next();
      },
      Account.closeOperatingDate.bind(Account, {
        operatingDate : fixtures.institutions[0].operatingDate,
        institution: fixtures.institutions[0]
      }),
      function(results, next) {
        assert.ok(results);
        assert.equal(results.accounts, accounts);
        next();
      },
      DailyBalance.find.bind(DailyBalance, {
        operatingDate : fixtures.institutions[0].operatingDate,
        institution: fixtures.institutions[0]
      })
    ], function(err, results) {
      assert.ok(!err, "Error occured: " + (err&&err.message));
      assert.ok(results);
      assert.equal(results.length, accounts);
      done();
    });

  });

  it("should fail to provide settlement at closeOperatingDate if options is not assigned", function(done) {
    Account.closeOperatingDate({
    }, function(err, results) {
      assert.ok(err);
      assert.ok(!results);
      assert.equal(err.message, "You should specify closing operatingDate");
      done();
    });
  });

  after(function(done) {
    mongoose.connection.db.dropDatabase();
    mongoose.connection.close(done);
  });

});
