var _ = require('lodash');
var requireMetadata = require('./requireMetadata.js');

function buildTree(config, tasks) {
  return _.map(tasks, function(task) {
    var metadata = requireMetadata(config);
    var meta = metadata.get(task);
    if (meta) {
      return meta.tree;
    }

    var name = task.displayName || task.name || '<anonymous>';
    meta = {
      name: name,
      tree: {
        label: name,
        type: 'function',
        nodes: []
      }
    };

    metadata.set(task, meta);
    return meta.tree;
  });
}

module.exports = buildTree;
