var ObjectId = require("mongoose").Types.ObjectId;
var ISODate = Date.parse;

module.exports = exports = [

  {
    "__t" : "CurrentAccountContract",
    "_id" : ObjectId("56e0568b714bfb660ab413f6"),
    "accounts" : {
      "current" : "001:26207000000007-2620.EUR",
      "interests" : "001:26289000000001-2628.EUR"
    },
    "institution" : ObjectId("56d481db3a4c513a1addd11a"),
    "legalNumber" : "001",
    "owner" : ObjectId("56d48bd988d600c21be55f05"),
    "product" : {
      "withdrawlFee" : 0.05,
      "positiveBalanceAPR" : 0.04,
      "accrueInterestsOnTheFirstDay" : false,
      "accounts" : {
        "expenses" : "001:70009000000002-7000.EUR",
        "incomes" : "001:60007000000001-6000.EUR",
        "outgoingGateway" : "001:29091000000001-2909.EUR",
        "incomingGateway" : "001:28090000000001-2809.EUR"
      },
      "tags" : [
        "INVESTORS ACCOUNTS"
      ],
      "status" : "active",
      "__t" : "InvestorAccountProduct",
      "title" : "Investor Account of Private Individual",
      "statusDate" : ISODate("2016-03-03T10:53:55.761Z"),
      "institution" : ObjectId("56d481db3a4c513a1addd11a"),
      "description" : "...",
      "code" : "PI_IA.001",
      "category" : "IA/PI",
      "accountingPolicy" : ObjectId("56d81579e599a1bb0757ae7c"),
      "_id" : ObjectId("56d817c31958540309925f5c"),
    },
    "productCode" : "PI_IA.001",
    "settlementDayOfMonth" : 1,
    "settlementPeriod" : {
      "start" : ISODate("2016-04-02T00:00:00Z"),
      "end" : ISODate("2016-05-01T00:00:00Z")
    },
    "status" : "active",
    "statusDate" : ISODate("2016-03-09T17:01:23.204Z")
  }, {
    "__t" : "CurrentAccountContract",
    "_id" : ObjectId("56e29a1842812c5d097f3ecb"),
    "accounts" : {
      "interests" : "001:26280000000002-2628.EUR",
      "current" : "001:26208000000008-2620.EUR"
    },
    "institution" : ObjectId("56d481db3a4c513a1addd11a"),
    "legalNumber" : "PETROV-001",
    "owner" : ObjectId("56d48bd988d600c21be55f05"),
    "product" : {
      "withdrawlFee" : 0.05,
      "positiveBalanceAPR" : 0.04,
      "accrueInterestsOnTheFirstDay" : false,
      "accounts" : {
        "expenses" : "001:70009000000002-7000.EUR",
        "incomes" : "001:60007000000001-6000.EUR",
        "outgoingGateway" : "001:29091000000001-2909.EUR",
        "incomingGateway" : "001:28090000000001-2809.EUR"
      },
      "tags" : [
        "INVESTORS ACCOUNTS"
      ],
      "status" : "active",
      "__t" : "InvestorAccountProduct",
      "title" : "Investor Account of Private Individual",
      "statusDate" : ISODate("2016-03-03T10:53:55.761Z"),
      "institution" : ObjectId("56d481db3a4c513a1addd11a"),
      "description" : "...",
      "code" : "PI_IA.001",
      "category" : "IA/PI",
      "accountingPolicy" : ObjectId("56d81579e599a1bb0757ae7c"),
      "_id" : ObjectId("56d817c31958540309925f5c"),
    },
    "productCode" : "PI_IA.001",
    "settlementDayOfMonth" : 20,
    "settlementPeriod" : {
      "start" : ISODate("2016-04-02T00:00:00Z"),
      "end" : ISODate("2016-04-19T00:00:00Z")
    },
    "status" : "active",
    "statusDate" : ISODate("2016-03-11T10:12:40.150Z")
  }, {
    "__t" : "CurrentAccountContract",
    "_id" : ObjectId("56e299a442812c5d097f3eca"),
    "accounts" : {
      "interests" : "001:26087000000001-2608.EUR",
      "current" : "001:26001000000003-2600.EUR"
    },
    "institution" : ObjectId("56d481db3a4c513a1addd11a"),
    "legalNumber" : "MS-001",
    "owner" : ObjectId("56d562cbd5d6af6a0722b451"),
    "product" : {
      "__v" : 0,
      "_id" : ObjectId("56e287ed72275316068bb184"),
      "accountingPolicy" : ObjectId("56e28f9072275316068bb187"),
      "category" : "IA/LE",
      "code" : "LE_IA.001",
      "description" : "...",
      "institution" : ObjectId("56d481db3a4c513a1addd11a"),
      "statusDate" : ISODate("2016-03-11T08:55:09.774Z"),
      "title" : "Investor Account of Legal Entities",
      "__t" : "InvestorAccountProduct",
      "status" : "active",
      "tags" : [
        "INVESTORS ACCOUNTS"
      ],
      "accounts" : {
        "incomingGateway" : "001:28090000000001-2809.EUR",
        "outgoingGateway" : "001:29091000000001-2909.EUR",
        "incomes" : "001:60007000000001-6000.EUR",
        "expenses" : "001:70009000000002-7000.EUR"
      },
      "accrueInterestsOnTheFirstDay" : true,
      "positiveBalanceAPR" : 0.12,
      "withdrawlFee" : 0.01
    },
    "productCode" : "LE_IA.001",
    "settlementDayOfMonth" : 5,
    "settlementPeriod" : {
      "start" : ISODate("2016-04-05T00:00:00Z"),
      "end" : ISODate("2016-05-04T00:00:00Z")
    },
    "status" : "active",
    "statusDate" : ISODate("2016-03-11T10:10:44.147Z")
  }, {
    "_id" : ObjectId("56fbd972d7a026900f93b274"),
    "settlementPeriod" : {
      "start" : ISODate("2016-04-06T00:00:00Z"),
      "end" : ISODate("2016-04-30T00:00:00Z")
    },
    "product" : {
      "status" : "active",
      "active" : {
        "from" : ISODate("2016-03-02T15:45:00Z")
      },
      "tags" : [
        "VOID",
        "void"
      ],
      "statusHistory" : [ ],
      "__v" : 0,
      "_id" : ObjectId("56d6eeb6ce99373638e37592"),
      "institution" : ObjectId("56d481db3a4c513a1addd11a"),
      "accountingPolicy" : ObjectId("56d6ecdfce99373638e37590"),
      "statusDate" : ISODate("2016-03-02T15:45:00Z"),
      "category" : "VOID",
      "description" : "....",
      "title" : "Void product for void contracts",
      "code" : "VOID.001"
    },
    "statusDate" : ISODate("2016-03-30T13:49:38.913Z"),
    "owner" : ObjectId("56d48bd988d600c21be55f05"),
    "productCode" : "VOID.001",
    "institution" : ObjectId("56d481db3a4c513a1addd11a"),
    "settlementDayOfMonth" : 1,
    "accounts" : {
      "gateway" : "FIRST:37006000000006-3700.EUR"
    },
    "status" : "active"
  }
];
