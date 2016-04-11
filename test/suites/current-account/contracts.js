var async = require("async");
var assert = require('assert');
var mongoose = require('mongoose');
var models = require('../../../models/models');
var fixtures = {
  institutions: require('../../fixtures/institutions'),
  entities: require('../../fixtures/entities'),
  accounts: require('../../fixtures/accounts'),
  factories: require('../../fixtures/factories'),
  policies: require('../../fixtures/product-policies'),
  products: require('../../fixtures/products'),
  contracts: require('../../fixtures/contracts')
}

describe("models.currentAccountContract", function (done) {

  before(function (done) {
    var dbName = "temp_db_"+mongoose.Types.ObjectId().toString();
    mongoose.connect('mongodb://localhost/'+dbName);
    var iCollection = models.Institution.collection;
    var eCollection = models.Entity.collection;
    var prCollection= models.Product.collection;
    var aCollection = models.Account.collection;
    var fCollection = models.AccountFactory.collection;
    var pCollection = models.AccountingProductPolicy.collection;
    var cCollection = models.Contract.collection;
    async.series([
      iCollection.insert.bind(iCollection, fixtures.institutions),
      eCollection.insert.bind(eCollection, fixtures.entities),
      fCollection.insert.bind(fCollection, fixtures.factories),
      pCollection.insert.bind(pCollection, fixtures.policies),
      prCollection.insert.bind(prCollection, fixtures.products),
      aCollection.insert.bind(aCollection, fixtures.accounts),
      cCollection.insert.bind(cCollection, fixtures.contracts)
    ], function (err) {
      models.AccountFactory.update({}, {
        $set: {sequence: fixtures.accounts.length + 1}
      }, {multi: true}, done);
    });
  });

  it("should be created", function(done) {
    var caContract = new (models.currentAccountContract)({
      institution: fixtures.entities[0].institution,
      owner: fixtures.entities[0]._id,
      productCode: fixtures.products[2].code,
      status: "active"
    });
    caContract.save(function(err, _self) {
      assert.ok(!err, "Error occured: " + (err&&err.message));
      assert.ok(_self);
      assert.equal(_self, caContract);
      done();
    });
  });

  it("sholud be recharged", function(done) {
    var caContract = models.currentAccountContract;
    var contract;
    var amountToRefill = 1000;
    async.waterfall([
      caContract.findOne.bind(caContract, {status: "active"}),
      function (_contract) {
        contract = _contract;
        assert.ok(contract, "No Current Account Contract was found.")
        var next = arguments[arguments.length - 1];
        contract.refill({
          amount: amountToRefill,
          tag: "test:1",
          description: "Test refilling"
        }, next);
      }
    ], function (err, _contract) {
      assert.ok(!err, "Error occured: " + (err&&err.message));
      assert.ok(_contract);
      assert.equal(_contract, contract);
      assert.ok(contract.accounts.current);
      assert.ok(contract.accounts.current.title);
      assert.equal(contract.accounts.current.balance, amountToRefill);
      done();
    });
  });

  it("sholud be withdrawn with fee", function(done) {
    var caContract = models.currentAccountContract;
    var contract;
    var amountToRefill = 5000;
    var amountToWithdraw = 3000;

    var Q = caContract.findOne({status: "active"}).skip(1);
    async.waterfall([
      Q.exec.bind(Q),
      function (_contract) {
        contract = _contract;
        assert.ok(contract, "No Current Account Contract was found.")
        var next = arguments[arguments.length - 1];
        contract.refill({
          amount: amountToRefill,
          tag: "test:2",
          description: "Test refilling"
        }, next);
      },
      function () {
        var next = arguments[arguments.length-1];
        contract.withdraw({
          amount: amountToWithdraw,
          tag: "test:3",
          description: "Test withdrawing"
        }, next);
      }
    ], function (err, _contract) {
      assert.ok(!err, "Error occured: " + (err&&err.message));
      assert.ok(_contract);
      assert.equal(_contract, contract);
      assert.ok(contract.accounts.current);
      assert.ok(contract.accounts.current.title);
      var expFee = Math.round(amountToWithdraw * contract.product.withdrawlFee);
      var expBalance = amountToRefill - amountToWithdraw - expFee;
      assert.equal(contract.accounts.current.balance, expBalance);
      done();
    });
  });

  it("sholud be withdrawn without fee", function(done) {
    var caContract = models.currentAccountContract;
    var amountToRefill = 5000;
    var amountToWithdraw = 3000;
    var contract = new caContract({
      institution: fixtures.entities[0].institution,
      owner: fixtures.entities[0]._id,
      productCode: "PI_CA.111",
      status: "active"
    });
    async.waterfall([
      contract.save.bind(contract),
      function (_contract) {
        assert.ok(contract, "No Current Account Contract was found.")
        assert.equal(contract, _contract);
        var next = arguments[arguments.length - 1];
        contract.refill({
          amount: amountToRefill,
          tag: "test:5",
          description: "Test refilling"
        }, next);
      },
      function () {
        var next = arguments[arguments.length-1];
        contract.withdraw({
          amount: amountToWithdraw,
          tag: "test:6",
          description: "Test withdrawing"
        }, next);
      }
    ], function (err, _contract) {
      assert.ok(!err, "Error occured: " + (err&&err.message));
      assert.ok(_contract);
      assert.equal(_contract, contract);
      assert.ok(contract.accounts.current);
      assert.ok(contract.accounts.current.title);
      var expFee = 0;
      var expBalance = amountToRefill - amountToWithdraw - expFee;
      assert.equal(contract.accounts.current.balance, expBalance);
      done();
    });
  });

  it("sholud be failed to withdraw with fee rollback", function(done) {
    var caContract = models.currentAccountContract;
    var contract;
    var amountToRefill = 5000;
    var amountToWithdraw;

    var Q = caContract.findOne({status: "active"});
    async.waterfall([
      Q.exec.bind(Q),
      function (_contract) {
        contract = _contract;
        assert.ok(contract, "No Current Account Contract was found.")
        var next = arguments[arguments.length - 1];
        contract.refill({
          amount: amountToRefill,
          tag: "test:7",
          description: "Test refilling"
        }, next);
      },
      function () {
        var next = arguments[arguments.length-1];
        amountToWithdraw = contract.accounts.current.balance;
        contract.withdraw({
          amount: amountToWithdraw,
          tag: "test:8",
          description: "Test withdrawing"
        }, next);
      }
    ], function (err) {
      assert.ok(err);
      assert.equal(err.message, "Negative balance of debitAccount");
      assert.equal(contract.accounts.current.balance, amountToWithdraw);
      var Tx = mongoose.model("tx_CA_Withdrawl_Fee");
      var Q = Tx.findOne({globalUniqueTag:"CURRENT_ACCOUNTS/FEES/WITHDRAWL:test:8"});
      var expFee = Math.round(amountToWithdraw * contract.product.withdrawlFee);
      Q.exec(function (err, tx) {
        assert.ok(!err, "Error occured: " + (err&&err.message));
        assert.ok(tx);
        assert.equal(tx.amount, expFee);
        assert.equal(tx.status, "canceled");
        done();
      })

    });
  });

  after(function (done) {
    mongoose.connection.db.dropDatabase();
    mongoose.connection.close(done);
  });
})
