'use strict';

const modelAPI = require('../api');
const models = require('../../models').models;

modelAPI.expose(models.currentAccountProduct, {
  plural: "CurrentAccountProducts"
});


modelAPI.expose(models.currentAccountContract, {
  fields: '-__t -__v -product.__t -product.__v',
  plural: "CurrentAccountContracts",
  expose: {
    refill: true,
    withdraw: true,
    accrueInterests: true,
    payoutInterests: true
  },
  exposeStatic: {
    refill: true,
    withdraw: true
  },
  search: {
    populate: "accounts.current"
  },
  populate: "accounts.current accounts.interests"
});

module.exports = exports = modelAPI;
