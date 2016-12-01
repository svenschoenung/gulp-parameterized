var _ = require('lodash');

function normalizeConfig(config) {
  config.gulp = toFunction(config.gulp);
  config.paramsName = toArray(config.paramsName);
  config.callbackName = toArray(config.callbackName);

  return config;
}

function toFunction(arg) {
  return _.isFunction(arg) ? arg : function() { return arg; };
}

function toArray(arg) {
  return _.isArray(arg) ? arg : [arg];
}

module.exports = normalizeConfig;
