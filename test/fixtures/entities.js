var ObjectId = require("mongoose").Types.ObjectId;
var ISODate = Date.parse;

module.exports = exports = [
  {
    "title" : "Petro Petrov",
    "code" : "1234567890",
    "birthday" : ISODate("1980-01-23T00:00:00Z"),
    "institution" : ObjectId("56d481db3a4c513a1addd11a"),
    "__t" : "PrivateIndividual",
    "updated" : ISODate("2016-02-29T18:20:09.613Z"),
    "comments" : [ ],
    "attachments" : [ ],
    "_id" : ObjectId("56d48bd988d600c21be55f05"),
    "skype" : [ ],
    "phone" : [ ],
    "email" : [ ],
    "idDocument" : {
      "type" : "passport",
      "number" : "PP 012210",
      "issuranceDate" : ISODate("1996-02-01T00:00:00Z")
    },
    "name" : {
      "first" : "Petro",
      "middle" : "P.",
      "last" : "Petrov"
    }
  }, {
    "title" : "Semion Semionov",
    "code" : "2134567890",
    "birthday" : ISODate("1970-10-09T00:00:00Z"),
    "institution" : ObjectId("56d481db3a4c513a1addd11a"),
    "__t" : "PrivateIndividual",
    "updated" : ISODate("2016-02-29T18:36:53.572Z"),
    "comments" : [ ],
    "attachments" : [ ],
    "_id" : ObjectId("56d48fc5169d50951cb97de1"),
    "skype" : [ ],
    "phone" : [ ],
    "email" : [ ],
    "idDocument" : {
      "type" : "passport",
      "number" : "CC 301103",
      "issuranceDate" : ISODate("1996-12-14T00:00:00Z")
    },
    "name" : {
      "first" : "Sidor",
      "middle" : "S.",
      "last" : "Sidorov"
    }
  }, {
    "title" : "Sidor Sidorov",
    "code" : "2134567890",
    "birthday" : ISODate("1970-10-09T00:00:00Z"),
    "institution" : ObjectId("56d481db3a4c513a1addd11a"),
    "__t" : "PrivateIndividual",
    "updated" : ISODate("2016-02-29T18:41:28.198Z"),
    "comments" : [ ],
    "attachments" : [ ],
    "_id" : ObjectId("56d490d89889a73b1d792550"),
    "skype" : [ ],
    "phone" : [ ],
    "email" : [ ],
    "idDocument" : {
      "type" : "passport",
      "number" : "CC 301103",
      "issuranceDate" : ISODate("1996-12-14T00:00:00Z")
    },
    "name" : {
      "first" : "Sidor",
      "middle" : "S.",
      "last" : "Sidorov"
    }
  }, {
    "title" : "Microsoft Corp.",
    "code" : "USA:001-002-004",
    "institution" : ObjectId("56d481db3a4c513a1addd11a"),
    "__t" : "LegalEntity",
    "updated" : ISODate("2016-03-01T09:37:15.016Z"),
    "comments" : [ ],
    "attachments" : [ ],
    "_id" : ObjectId("56d562cbd5d6af6a0722b451"),
  }

];
