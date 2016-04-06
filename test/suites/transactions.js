var async = require("async")
var assert = require('assert');
var mongoose = require('mongoose');
var Institution = require('../../models/institutions').Institution;
var accounts = require('../../models/accounts');
var Transaction = require('../../models/transactions').Transaction;
var Account = accounts.Account;
var fixtures = {
  institutions: require('../fixtures/institutions'),
  accounts: require('../fixtures/accounts')
}

describe("models.Transaction", function (done) {

  before(function(done) {
    var dbName = "temp_db_" + mongoose.Types.ObjectId().toString();
    mongoose.connect('mongodb://localhost/'+dbName);
    var iCollection = Institution.collection;
    var aCollection = Account.collection;
    async.series([
      iCollection.insert.bind(iCollection, fixtures.institutions),
      aCollection.insert.bind(aCollection, fixtures.accounts),
      Transaction.ensureIndexes.bind(Transaction)
    ], done);
  });

  it("should be created", function(done) {
    var T = new Transaction({
      debitAccount: "001:26207000000007-2620.EUR",
      creditAccount: "001:60007000000001-6000.EUR",
      amount: 1000,
      type: "JUST A TRANSACTION",
      description: "Testing",
      status: "approved"
    });
    T.save(function (err, _self) {
      assert.ok(!err, "Error while saving the transaction: "+(err&&err.message));
      assert.ok(_self);
      assert.ok(_self == T);
      assert.ok(_self.operatingDate);
      assert.ok(_self.institution);
      done();
    })
  });

  it("shoold fail to save with not unique tag", function (done) {
    var T1 = new Transaction({
      debitAccount: "001:26207000000007-2620.EUR",
      creditAccount: "001:60007000000001-6000.EUR",
      amount: 1000,
      type: "JUST A TRANSACTION",
      description: "Testing",
      status: "approved",
      globalUniqueTag: "1"
    });
    var T2 = new Transaction({
      debitAccount: "001:26207000000007-2620.EUR",
      creditAccount: "001:60007000000001-6000.EUR",
      amount: 1000,
      type: "JUST A TRANSACTION",
      description: "Testing",
      status: "approved",
      globalUniqueTag: "1"
    });

    async.series([
      T1.save.bind(T1),
      T2.save.bind(T2)
    ], function(err, results) {
      var _t1 = results[0] && results[0][0];
      var _t2 =  results[1] && results[1][0];
      assert.ok(err);
      assert.ok(_t1 != null);
      assert.ok(_t2 == null);
      done();
    });

  });

  it("should be executed in not strict mode respecting a balance restrictions", function(done) {
    var T = new Transaction({
      debitAccount: "001:28090000000001-2809.EUR",
      creditAccount: "001:26206000000006-2620.EUR",
      amount: 1000,
      type: "ACCOUNT DEPOSIT",
      description: "Recharging of the account",
      status: "approved",
      strictMode: false
    });
    T.execute(function (err, _self) {
      assert.ok(!err, "Error while saving the transaction: "+(err&&err.message));
      assert.ok(_self);
      assert.ok(_self == T);
      assert.ok(_self.operatingDate);
      assert.ok(_self.institution);
      assert.equal(_self.status, "done");
      var Q = Transaction.findById(T._id).populate("debitAccount creditAccount");
      Q.exec(function(err, _self) {
        assert.ok(!err);
        assert.ok(_self);
        assert.equal(_self.debitAccount.debit, T.amount);
        assert.equal(_self.debitAccount.currentDebit, T.amount);
        assert.equal(_self.debitAccount.balance, T.amount);
        assert.equal(_self.creditAccount.credit, T.amount);
        assert.equal(_self.creditAccount.currentCredit, T.amount);
        assert.equal(_self.creditAccount.balance, T.amount);
        done();
      });
    });
  });

  it("should be executed in not strict mode violating a balance restrictions", function(done) {
    var T = new Transaction({
      debitAccount: "001:26205000000005-2620.EUR",
      creditAccount: "001:29091000000001-2909.EUR",
      amount: 1000,
      type: "ACCOUNT DEPOSIT",
      description: "Recharging of the account",
      status: "approved",
      strictMode: false
    });
    T.execute(function (err, _self) {
      assert.ok(!err, "Error while saving the transaction: "+(err&&err.message));
      assert.ok(_self);
      assert.ok(_self == T);
      assert.ok(_self.operatingDate);
      assert.ok(_self.institution);
      assert.equal(_self.status, "done");
      var Q = Transaction.findById(T._id).populate("debitAccount creditAccount");
      Q.exec(function(err, _self) {
        assert.ok(!err);
        assert.ok(_self);
        assert.equal(_self.debitAccount.debit, T.amount);
        assert.equal(_self.debitAccount.currentDebit, T.amount);
        assert.equal(_self.debitAccount.balance, -T.amount);
        assert.equal(_self.creditAccount.credit, T.amount);
        assert.equal(_self.creditAccount.currentCredit, T.amount);
        assert.equal(_self.creditAccount.balance, T.amount);
        done();
      });
    });
  });

  it("should be executed in strict mode respecting a balance restrictions", function(done) {
    var T = new Transaction({
      debitAccount: "001:28091000000002-2809.EUR",
      creditAccount: "001:26204000000004-2620.EUR",
      amount: 1000,
      type: "ACCOUNT DEPOSIT",
      description: "Recharging of the account",
      status: "approved",
      strictMode: true
    });
    T.execute(function (err, _self) {
      assert.ok(!err, "Error while saving the transaction: "+(err&&err.message));
      assert.ok(_self);
      assert.ok(_self == T);
      assert.ok(_self.operatingDate);
      assert.ok(_self.institution);
      assert.equal(_self.status, "done");
      var Q = Transaction.findById(T._id).populate("debitAccount creditAccount");
      Q.exec(function(err, _self) {
        assert.ok(!err);
        assert.ok(_self);
        assert.equal(_self.debitAccount.debit, T.amount);
        assert.equal(_self.debitAccount.currentDebit, T.amount);
        assert.equal(_self.debitAccount.balance, T.amount);
        assert.equal(_self.creditAccount.credit, T.amount);
        assert.equal(_self.creditAccount.currentCredit, T.amount);
        assert.equal(_self.creditAccount.balance, T.amount);
        done();
      });
    });
  });

  it("should be failed in not strict mode if violates a balance restrictions", function(done) {
    var T = new Transaction({
      debitAccount: "001:26203000000003-2620.EUR",
      creditAccount: "001:29092000000002-2909.EUR",
      amount: 1000,
      type: "ACCOUNT DEPOSIT",
      description: "Recharging of the account",
      status: "approved",
      strictMode: true
    });
    T.execute(function (err, _self) {
      assert.ok(err)
      assert.ok(_self);
      assert.ok(_self == T);
      assert.ok(_self.operatingDate);
      assert.ok(_self.institution);
      assert.equal(_self.status, "failed");
      assert.equal(_self.statusDescription, "Negative balance of debitAccount");
      var Q = Transaction.findById(T._id).populate("debitAccount creditAccount");
      Q.exec(function(err, _self) {
        assert.ok(!err);
        assert.ok(_self);
        assert.equal(_self.debitAccount.debit, 0);
        assert.equal(_self.debitAccount.currentDebit, 0);
        assert.equal(_self.debitAccount.balance, 0);
        assert.equal(_self.creditAccount.credit, 0);
        assert.equal(_self.creditAccount.currentCredit, 0);
        assert.equal(_self.creditAccount.balance, 0);
        done();
      });
    });
  });

  it("should be canceled", function(done) {
    var dA, cA;
    var T = new Transaction({
      debitAccount: "001:28091000000002-2809.EUR",
      creditAccount: "001:26204000000004-2620.EUR",
      amount: 234,
      type: "ACCOUNT DEPOSIT",
      description: "Recharging of the account",
      status: "approved",
      strictMode: true
    });
    var populateBalances = function (_t, next) {
      _t.populate("debitAccount creditAccount", next)
    };
    async.waterfall([
      T.execute.bind(T),
      populateBalances,
      function (_t, next) {dA = _t.debitAccount.toObject(); cA = _t.creditAccount.toObject(); next(null, _t)},
      function (_t, next) {_t.cancel(next);},
      populateBalances
    ], function(err, _t) {
      assert.ok(!err);
      assert.ok(_t);
      assert.ok(_t.status === "canceled");
      assert.equal(_t.debitAccount.debit, dA.debit - _t.amount);
      assert.equal(_t.debitAccount.credit, dA.credit);
      assert.equal(_t.creditAccount.credit, cA.credit - _t.amount);
      assert.equal(_t.creditAccount.debit, cA.debit);
      done();
    })
  });

  after(function(done) {
    mongoose.connection.db.dropDatabase();
    mongoose.connection.close(done);
  })

});
