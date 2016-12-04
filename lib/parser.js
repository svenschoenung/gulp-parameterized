var _ = require('lodash');
var yargs = require('yargs/yargs');

function splitIntoArgs(str) {
  return str.split(/\s+/);
}

function isParamWithValue(str) {
  return str.match(/^-.*=/);
}

function isParam(str) {
  return str.match(/^-/) && !isNumber(str);
}

function isNumber (x) {
  return /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(x)
}

function splitIntoTasks(args) {
  var argsByTask = { null: [] };
  var task = null;
  var previousWasParam = false;
  args.forEach(function(arg) {
    if (isParamWithValue(arg)) {
      argsByTask[task].push(arg);
      previousWasParam = false;
    } else if (isParam(arg)) {
      argsByTask[task].push(arg);
      previousWasParam = true;
    } else if (previousWasParam) {
      argsByTask[task].push(arg);
      previousWasParam = false;
    } else {
      argsByTask[task = arg] = [];
      previousWasParam = false;
    }
  });
  return argsByTask;
}

function proxy(self, yargsParser, fnName) {
  self[fnName] = function() {
    yargsParser[fnName].apply(yargsParser, arguments);
    return self;
  };
}

function ParamsParser() {
  var yargsParser = yargs().fail(function(msg, err) {
    if (err) throw err;
    throw new Error(msg);
  });

  proxy(this, yargsParser, 'alias');
  proxy(this, yargsParser, 'choices');
  proxy(this, yargsParser, 'number');
  proxy(this, yargsParser, 'normalize');
  proxy(this, yargsParser, 'string');

  this.parse = function(args) {
    if (_.isPlainObject(args)) {
      return (args[null]) ? args : { null: args };
    }
    if (_.isArray(args)) {
      var argsByTask = splitIntoTasks(args);
      var paramsByTask = {};
      Object.keys(argsByTask).map(function(task) {
        paramsByTask[task] = yargsParser.parse(argsByTask[task]);
        delete paramsByTask[task]['_'];
        delete paramsByTask[task]['$0'];
      });
      return paramsByTask;
    }
    if (_.isString(args)) {
      return this.parse(splitIntoArgs(args))
    }
    throw new Error('cannot parse arguments of type ' + typeof arg);
  };
}

module.exports = function parser() {
  return new ParamsParser();
};
