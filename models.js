//var db = require("./models").db;
var institutions = require("./models/institutions");
var policies = require("./models/accounting-policies");
var accounts = require("./models/accounts");
var transactions = require("./models/transactions");
var products = require("./models/products");
var contracts = require("./models/contracts");
var entities = require("./models/entities");
var investorsAccounts = require("./models/current-account");

module.exports = exports = {
  Institution: institutions.Institution,
  AccountingPolicy: policies.AccountingPolicy,
  AccountingProductPolicy: policies.AccountingProductPolicy,
  Account: accounts.Account,
  AccountFactory: accounts.AccountFactory,
  Transaction: transactions.Transaction,
  Product: products.Product,
  Contract: contracts.Contract,
  Entity: entities.Entity,
  PrivateIndividual: entities.PrivateIndividual,
  LegalEntity: entities.LegalEntity,
  InvestorAccountContract: investorsAccounts.Contract,
  InvestorAccountProduct: investorsAccounts.Product
};
