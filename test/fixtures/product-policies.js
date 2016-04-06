var ObjectId = require("mongoose").Types.ObjectId;

module.exports = exports = [
  {
    "title" : "Accounting Policy for VOID contracts",
    "description" : "...",
    "institution" : ObjectId("56d481db3a4c513a1addd11a"),
    "_id" : ObjectId("56d6ecdfce99373638e37590"),
    "factories" : [
      {
        "accountName" : "gateway",
        "factory" : ObjectId("56d6ec81ce99373638e3758d"),
        "openOn" : "creation"
      }
    ],
  }, {
    "title" : "PI Investor Account Policy",
    "description" : "...",
    "institution" : ObjectId("56d481db3a4c513a1addd11a"),
    "_id" : ObjectId("56d81579e599a1bb0757ae7c"),
    "factories" : [
      {
        "accountName" : "current",
        "factory" : ObjectId("56d56099362dc10707701933"),
        "openOn" : "creation"
      },
      {
        "accountName" : "holds",
        "factory" : ObjectId("56d4895768eff04e1b0f1d88"),
        "openOn" : "acceptance"
      },
      {
        "accountName" : "interests",
        "factory" : ObjectId("56d80fd4e599a1bb0757ae7b"),
        "openOn" : "first-usage"
      }
    ]
  }, {
    "title" : "LE Investor Account Policy",
    "description" : "...",
    "institution" : ObjectId("56d481db3a4c513a1addd11a"),
    "_id" : ObjectId("56e28f9072275316068bb187"),
    "factories" : [
      {
        "accountName" : "current",
        "factory" : ObjectId("56e2892672275316068bb185"),
        "openOn" : "creation"
      },
      {
        "accountName" : "holds",
        "factory" : ObjectId("56e2892672275316068bb185"),
        "openOn" : "acceptance"
      },
      {
        "accountName" : "interests",
        "factory" : ObjectId("56e2896172275316068bb186"),
        "openOn" : "first-usage"
      },
      {
        "accountName" : "receivables",
        "factory" : ObjectId("56d560be362dc10707701934"),
        "openOn" : "acceptance"
      }
    ]
  }
];
