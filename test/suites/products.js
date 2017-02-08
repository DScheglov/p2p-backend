var async = require("async")
var assert = require('assert');
var mongoose = require('../../mongoose')
var Institution = require('../../models/institutions').Institution;
var ProductPolicy = require('../../models/accounting-policies').AccountingProductPolicy;
var Contract = require('../../models/contracts').Contract;
var Product = require('../../models/products').Product;
var fixtures = {
  institutions: require('../fixtures/institutions'),
  policies: require('../fixtures/product-policies'),
  products: require('../fixtures/products'),
  contracts: require('../fixtures/contracts')
}


describe("models.Product", function (done) {

  before(function (done) {
    var dbName = "temp_db_" + mongoose.Types.ObjectId().toString();
    mongoose.connect('mongodb://localhost/'+dbName);
    var iCollection = Institution.collection;
    var cCollection = Contract.collection;
    var pCollection = ProductPolicy.collection;
    var prCollection= Product.collection;
    async.series([
      iCollection.insert.bind(iCollection, fixtures.institutions),
      cCollection.insert.bind(cCollection, fixtures.contracts),
      pCollection.insert.bind(pCollection, fixtures.policies),
      prCollection.insert.bind(prCollection, fixtures.products)
    ], done)
  });

  it("should be created", function(done) {
    var product = new Product({
        "code" : "VOID.100",
        "title" : "Void product for void contracts",
        "description" : "....",
        "category" : "VOID",
        "accountingPolicy" : fixtures.policies[0]._id,
        "institution" : fixtures.institutions[0]._id,
        "tags" : [
          "VOID", "void"
        ],
        "status" : "active",
      });
    product.save(function (err, _self) {
      assert.ok(!err, "Error occured: "+(err&&err.message));
      assert.ok(_self);
      assert.equal(_self, product);
      done();
    });
  });

  it("should be found by code", function (done) {
    Product.findOne({
      institution: fixtures.institutions[0]._id,
      code: "VOID.001"
    }, function(err, product) {
      assert.ok(!err, "Error occured: "+ (err&&err.message));
      assert.ok(product);
      assert.equal(product.code, "VOID.001");
      done();
    });
  });

  it("should update contracts with populating product info", function(done) {
    this.timeout(1000);
    var product;
    async.waterfall([
      Product.findOne.bind(Product, {
        institution: fixtures.institutions[0]._id,
        code: "VOID.001"
      }),
      function(_product, next) {
        product = _product;
        product.title = "Updated: " + product.title;
        product.save(next)
      },
    ], function(err) {
      assert.ok(!err, "Error occured: "+(err&&err.message));
      setTimeout(function(){
        Contract.find({
          institution: fixtures.institutions[0]._id,
          productCode: "VOID.001"
        }, function (err, contracts) {
          assert.ok(!err, "Error occured: " + (err&&err.message));
          assert.ok(contracts);
          assert.ok(contracts.length);
          for (var i = 0; i<contracts.length; i++) {
            assert.equal(contracts[i].product.title, product.title);
          }
          done();
        })
      }, 0)
    });
  });

  after(function (done) {
    mongoose.connection.db.dropDatabase();
    mongoose.connection.close(done);
  });
})
