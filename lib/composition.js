var isParams = require('./util/isParams.js').forComposition;
var requireMetadata = require('./util/requireMetadata.js');
var buildTree = require('./util/buildTree.js');

module.exports = function(config, parameterized, compName) {

  // parameterized.series()
  // parameterized.parallel()
  return function() {
    var args = Array.prototype.slice.call(arguments);

    var tasks, paramsFromArgs;
    if (isParams(args[args.length - 1])) {
      tasks = args.slice(0, args.length - 1);
      paramsFromArgs = args[args.length - 1];
    } else {
      tasks = args;
      paramsFromArgs = {};
    }

    var gulp = config.gulp(config);

    var compFn = parameterized('<' + compName + '>', function(_) {
      var cb = _;
      var params = _[config.paramsName[0]];

      var parameterizedTasks = tasks.map(function(task) {
        return parameterized(parameterized(task, paramsFromArgs), params);
      });
 
      return gulp[compName].apply(gulp, parameterizedTasks)(_.done);
    });

    var parameterizedTasks = tasks.map(function(task) {
      return parameterized(task, paramsFromArgs);
    });
    
    var metadata = requireMetadata(config);
    metadata.set(compFn, {
      name: compFn.displayName,
      branch: true,
      tree: {
        label: compFn.displayName,
        type: 'function',
        branch: true,
        nodes: buildTree(config, parameterizedTasks)
      }
    });    
 
    return compFn;    
  };

};


