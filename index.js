var _ = require('lodash');
var yargs = require('yargs');
var gutil = require('gulp-util');

var requireGulp = require('./lib/util/requireGulp.js');

var createTask = require('./lib/task.js');
var createComposition = require('./lib/composition.js');

function createInstance(config) {

  var gulp = config.gulp;
  config.gulp = _.isFunction(gulp) ? gulp : function() { return gulp; };

  var paramsName = config.paramsName;
  config.paramsName = _.isArray(paramsName) ? paramsName : [paramsName];

  var cbName = config.callbackName;
  config.callbackName = _.isArray(cbName) ? cbName : [cbName];

  var instance = createTask(config);

  instance.task = instance;
  instance.series = createComposition(config, instance, 'series');
  instance.parallel = createComposition(config, instance, 'parallel');

  instance.withGulp = function(gulp) {
    return createInstance(_.assign({}, config, {gulp: gulp}));
  };
  instance.withOptions = function(options) {
    return createInstance(_.assign({}, config, options));
  };

  return instance;
}

module.exports = createInstance({
  gulp: requireGulp,
  argv: yargs.argv,
  log: gutil.log,
  paramsName: ['params', 'parameters'],
  callbackName: ['done', 'cb', 'callback'],
  _require: null
});
