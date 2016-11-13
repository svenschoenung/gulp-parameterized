var _ = require('lodash');

function isParamsForTask(arg) {
  return _.isString(arg) || _.isArray(arg) || _.isPlainObject(arg);
}

function isParamsForComposition(arg) {
  return _.isArray(arg) || _.isPlainObject(arg);
}

module.exports = {
  forTask: isParamsForTask,
  forComposition: isParamsForComposition
};
