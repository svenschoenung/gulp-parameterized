var isParams = require('./util/isParams.js').forComposition;

module.exports = function(config, parameterized, compName) {

  // parameterize.series()
  // parameterize.parallel()
  return function() {
    var args = Array.prototype.slice.call(arguments);

    var tasks, params;
    if (isParams(args[args.length - 1])) {
      tasks = args.slice(0, args.length - 1);
      params = args[args.length - 1];
    } else {
      tasks = args;
      params = {};
    }

    var gulp = config.gulp();

    return parameterized('<' + compName + '>', function(cb, params) {
      return gulp[compName].apply(gulp, tasks.map(function(task) {
        return parameterized(parameterized(task), params);
      }))(cb);
    }, params);

  };

};


