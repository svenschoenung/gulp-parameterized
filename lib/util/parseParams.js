var _ = require('lodash');
var yargs = require('yargs');

function parseParams(params) {
  if (_.isString(params)) {
    return yargs.parse(params.trim().split('\s+'));
  }

  if (_.isArray(params)) {
    return yargs.parse(params);
  }

  if (_.isPlainObject(params)) {
    return params;
  }

  return {};
}

module.exports = parseParams;
