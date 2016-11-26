var isParams = require('./util/isParams.js').forComposition;
var requireMetadata = require('./util/requireMetadata.js');
var buildTree = require('./util/buildTree.js');

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

    var gulp = config.gulp(config);

    var compFn = parameterized('<' + compName + '>', function(_) {
      var parameterizedTasks = tasks.map(function(task) {
        return parameterized(parameterized(task), _.params);
      });
 
      return gulp[compName].apply(gulp, parameterizedTasks)(_.done);
    }, params);

    var parameterizedTasks = tasks.map(function(task) {
      return parameterized(task, params);
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


