var ObjectId = require("mongoose").Types.ObjectId;
var ISODate = Date.parse;

module.exports = exports = [{
    "code" : "VOID.001",
    "title" : "Void product for void contracts",
    "description" : "....",
    "category" : "VOID",
    "statusDate" : ISODate("2016-03-02T15:45:00Z"),
    "accountingPolicy" : ObjectId("56d6ecdfce99373638e37590"),
    "institution" : ObjectId("56d481db3a4c513a1addd11a"),
    "_id" : ObjectId("56d6eeb6ce99373638e37592"),
    "tags" : [
      "VOID", "void"
    ],
    "active" : {
      "from" : ISODate("2016-03-02T15:45:00Z")
    },
    "status" : "active",
  }, {
    "code" : "VOID.002",
    "title" : "Void product for void contracts",
    "description" : "....",
    "category" : "VOID",
    "statusDate" : ISODate("2016-03-02T15:45:00Z"),
    "accountingPolicy" : ObjectId("56d6ecdfce99373638e37590"),
    "institution" : ObjectId("56d481db3a4c513a1addd11a"),
    "_id" : ObjectId("56d70f1bc237ba6b3e1f72ea"),
    "tags" : [
      "VOID", "void"
    ],
    "active" : {
      "from" : ISODate("2016-03-02T15:45:00Z")
    },
    "status" : "active"
  }, {
    "__t" : "CurrentAccountProduct",
    "__v" : 0,
    "_id" : ObjectId("56d817c31958540309925f5c"),
    "accountingPolicy" : ObjectId("56d81579e599a1bb0757ae7c"),
    "accounts" : {
      "incomingGateway" : "FIRST:28090000000001-2809.EUR",
      "outgoingGateway" : "FIRST:29091000000001-2909.EUR",
      "incomes" : "FIRST:60007000000001-6000.EUR",
      "expenses" : "FIRST:70009000000002-7000.EUR"
    },
    "active" : {
      "from" : ISODate("2016-03-03T10:53:55.761Z")
    },
    "category" : "IA/PI",
    "code" : "PI_IA.001",
    "description" : "...",
    "institution" : ObjectId("56d481db3a4c513a1addd11a"),
    "positiveBalanceAPR" : 0.04,
    "productParams" : {

    },
    "status" : "active",
    "statusDate" : ISODate("2016-03-03T10:53:55.761Z"),
    "tags" : [
      "INVESTORS ACCOUNTS"
    ],
    "title" : "Investor Account of Private Individual",
    "withdrawlFee" : 0.05
  }, {
    "__t" : "CurrentAccountProduct",
    "_id" : ObjectId("56e287ed72275316068bb184"),
    "accountingPolicy" : ObjectId("56e28f9072275316068bb187"),
    "accounts" : {
      "incomingGateway" : "FIRST:28090000000001-2809.EUR",
      "outgoingGateway" : "FIRST:29091000000001-2909.EUR",
      "incomes" : "FIRST:60007000000001-6000.EUR",
      "expenses" : "FIRST:70009000000002-7000.EUR"
    },
    "accrueInterestsOnTheFirstDay" : true,
    "active" : {
      "from" : ISODate("2016-03-11T08:55:09.774Z")
    },
    "category" : "IA/LE",
    "code" : "LE_IA.001",
    "description" : "...",
    "institution" : ObjectId("56d481db3a4c513a1addd11a"),
    "positiveBalanceAPR" : 0.12,
    "productParams" : {

    },
    "status" : "active",
    "statusDate" : ISODate("2016-03-11T08:55:09.774Z"),
    "tags" : [
      "INVESTORS ACCOUNTS"
    ],
    "title" : "Investor Account of Legal Entities",
    "withdrawlFee" : 0.01
  }

];
