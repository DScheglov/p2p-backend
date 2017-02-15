'use strict';

const modelAPI = require('./api');
const models = require('../models').models;


modelAPI.expose(models.Account);

modelAPI.expose(models.AccountFactory, {
  plural: "AccountFactories",
  exposeStatic: {
    openAccount: "Opens an Account for requested schema"
  },
  options: false
});
