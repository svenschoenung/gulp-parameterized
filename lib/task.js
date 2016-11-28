var _ = require('lodash');
var assert = require('assert');

var isParams = require('./util/isParams.js').forTask;
var parseParams = require('./util/parseParams.js');
//var printParams = require('./util/printParams.js');

function parseTaskAndParams(taskString) {
  var match = taskString.trim().match(/([^\s]+)(?:\s+(.*))?/);
  return {
    task: match[1],
    params: parseParams(match[2])
  };
}

function task(config, taskName, taskFn, paramsFromArgs) {
  var paramsFromCLI = config.argv;

  if (!taskFn) {
    taskFn = config.gulp(config).registry().get(taskName);
    assert(taskFn, 'Task never defined:' + taskName);
  }

  taskFnWithParams = function(cb, paramsFromCaller) {

    var params = _.assign({},
      paramsFromArgs,
      cb[config.paramsName[0]] || paramsFromCaller,
      paramsFromCLI
    );
    delete params['_'];
    delete params['$0'];

    function done(err) { return cb(err); }

    var cbWithParams = done;
    config.paramsName.forEach(function(paramsName) {
      cbWithParams[paramsName] = params;
    });
    config.callbackName.forEach(function(callbackName) {
      cbWithParams[callbackName] = done;
    });

    return taskFn(cbWithParams, params);

  };

  taskFnWithParams.displayName = taskName || '<anonymous>';

  return taskFnWithParams;
}

function getDisplayName(taskFn) {
  return taskFn.displayName || taskFn.name;
}

function failForArgCount(count) {
  throw new Error('parameterize.task(): wrong number of arguments: ' + count);
}

function failForArgTypes(args) {
  throw new Error('parameterize.task(): wrong argument types: ' +
    args.map(function(arg) { return '' + typeof(arg); })
  );
}

module.exports = function(config) {

  // parameterized.task()
  return function() {

    var args = Array.prototype.slice.call(arguments);

    var parsed, params;

    if (args.length === 3) {

      // parameterized.task(taskName, taskFn, params)
      if (_.isString(args[0]) && _.isFunction(args[1]) && isParams(args[2])) {
        parsed = parseTaskAndParams(args[0]);
        params = _.assign({}, parseParams(args[2]), parsed.params);
        return task(config, parsed.task, args[1], params);
      }

      return failForArgTypes(args);
    }

    if (args.length === 2) {

      // parameterized.task(taskName, taskFn)
      if (_.isString(args[0]) && _.isFunction(args[1])) {
        parsed = parseTaskAndParams(args[0]);
        return task(config, parsed.task, args[1], parsed.params); 
      }

      // parameterized.task(taskName, params)
      if (_.isString(args[0]) && isParams(args[1])) {
        parsed = parseTaskAndParams(args[0]);
        params = _.assign({}, parseParams(args[1]), parsed.params);
        return task(config, parsed.task, null, params);
      }

      // parameterized.task(taskFn, params)
      if (_.isFunction(args[0]) && isParams(args[1])) {
        params = parseParams(args[1]);
        return task(config, getDisplayName(args[0]), args[0], params);
      }

      return failForArgTypes(args);
    }

    if (args.length === 1) {
      // parameterized.task(taskNameWithParams)
      if (_.isString(args[0])) {
        parsed = parseTaskAndParams(args[0]);
        return task(config, parsed.task, null, parsed.params);
      }

      // parameterized.task(taskFn)
      if (_.isFunction(args[0])) {
        return task(config, getDisplayName(args[0]), args[0], {});
      }

      return failForArgTypes(args);
    }

    return failForArgCount(args.length);
  };
};
