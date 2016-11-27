'use strict';

/* global describe:false, it:false */

var chai = require('chai');
var expect = chai.expect;
var _ = require('lodash');

function requireUncached(mod) {
  delete require.cache[require.resolve(mod)];
  return require(mod);
}

function init(opts) {
  opts = opts || { argv: {} };
  return requireUncached('./index.js').withOptions(opts);
}

function testCallingTask(config, cb) {
  var parameterized = init(_.assign({ argv: {} }, config));
  var gulp = requireUncached('gulp');

  function resultCallback(r) { config.actual = r; }

  config.setup(gulp, parameterized, resultCallback);

  gulp.series('task')(function() {
    expect(config.actual).to.eql(config.expected);
    cb();
  });
}

function testCallingOtherTask(config) {
  var gulp = requireUncached('gulp');
  var parameterized = init();
  
  gulp.task(parameterized('otherTask', function(done, params) {
    config.actual = params;
    done();
  }));

  gulp.task('task', parameterized.apply(null, config.call));

  gulp.series('task')(function() {
    expect(config.actual).to.eql(config.expected);
    config.callback();
  });
}

describe('parameterized', function() {
  it('accepts a gulp instance via withGulp()', function(cb) {
    var gulp = requireUncached('gulp');
    gulp.task('task', function(done) { done(); });

    var parameterized = requireUncached('./index.js').withGulp(gulp);
    parameterized.series('task')(cb);
  });
  it('accepts a gulp instance via withOptions()', function(cb) {
    var gulp = requireUncached('gulp');
    gulp.task('task', function(done) { done(); });

    var parameterized = requireUncached('./index.js').withOptions({
      gulp:gulp
    });
    parameterized.series('task')(cb);
  });
  it('fails if no gulp instance can be found', function(cb) {
    var gulp = requireUncached('gulp');
    gulp.task('task', function(done) { done(); });

    var capturedOutput = '';
    var parameterized = requireUncached('./index.js').withOptions({
      _require: function(mod) {
        return require((mod === 'gulp') ? null : mod);
      },
      log: function (output) { capturedOutput += output; }
    });

    expect(parameterized.series.bind(null, 'task')).to.throw(Error);
    expect(capturedOutput).to.match(/Fatal error/);
    cb();
  });
  it('warns if gulp metadata cannot be accessed', function(cb) {
    var gulp = requireUncached('gulp');
    gulp.task('task', function(done) { done(); });

    var capturedOutput = '';
    var parameterized = requireUncached('./index.js').withOptions({
      _require: function(mod) {
        return (mod === 'gulp') ? require(mod) : null;
      },
      log: function (output) { capturedOutput += output; }
    });

    parameterized.series('task')(function() {
      expect(capturedOutput).to.match(/Warning/);
      cb();
    });
  });
});

describe('parameterized.task()', function() {

  it('provides a regular callback', function(cb) {
    testCallingTask({
      setup: function(gulp, parameterized, result) {
        gulp.task('task', parameterized(function(done) {
          result('taskCalled');
          done();
        }));
      },
      expected: 'taskCalled',  
    }, cb);
  });

  it('provides a _.done() callback', function(cb) {
    testCallingTask({
      setup: function(gulp, parameterized, result) {
        gulp.task('task', parameterized(function(_) {
          result('taskCalled');
          _.done();
        }));
      },
      expected: 'taskCalled',  
    }, cb);
  });

  it('provides a _.cb() callback', function(cb) {
    testCallingTask({
      setup: function(gulp, parameterized, result) {
        gulp.task('task', parameterized(function(_) {
          result('taskCalled');
          _.cb();
        }));
      },
      expected: 'taskCalled',  
    }, cb);
  });

  it('provides a _.callback() callback', function(cb) {
    testCallingTask({
      setup: function(gulp, parameterized, result) {
        gulp.task('task', parameterized(function(_) {
          result('taskCalled');
          _.callback();
        }));
      },
      expected: 'taskCalled',  
    }, cb);
  });

  it('can provide a custom named callback', function(cb) {
    testCallingTask({
      callbackName: 'theCallback',
      setup: function(gulp, parameterized, result) {
        gulp.task('task', parameterized(function(_) {
          result('taskCalled');
          _.theCallback();
        }));
      },
      expected: 'taskCalled',  
    }, cb);
  });

  it('can provide multiple custom named callbacks', function(cb) {
    testCallingTask({
      callbackName: ['theCallback', 'theOtherCallback'],
      setup: function(gulp, parameterized, result) {
        gulp.task('task', parameterized(function(_) {
          result('taskCalled');
          _.theOtherCallback();
        }));
      },
      expected: 'taskCalled',  
    }, cb);
  });

  it('provides params in _.params', function(cb) {
    testCallingTask({
      argv: { param: 'foo' },
      setup: function(gulp, parameterized, result) {
        gulp.task('task', parameterized(function(_) {
          result(_.params);
          _.done();
        }));
      },
      expected: { param: 'foo' },  
    }, cb);
  });

  it('provides params in _.parameters', function(cb) {
    testCallingTask({
      argv: { param: 'foo' },
      setup: function(gulp, parameterized, result) {
        gulp.task('task', parameterized(function(_) {
          result(_.parameters);
          _.done();
        }));
      },
      expected: { param: 'foo' },  
    }, cb);
  });

  it('can provide a custom named params object', function(cb) {
    testCallingTask({
      paramsName: 'theParams',
      argv: { param: 'foo' },
      setup: function(gulp, parameterized, result) {
        gulp.task('task', parameterized(function(_) {
          result(_.theParams);
          _.done();
        }));
      },
      expected: { param: 'foo' },  
    }, cb);
  });

  it('can provide multiple custom named params objects', function(cb) {
    testCallingTask({
      paramsName: ['theParams', 'theParameters'],
      argv: { param: 'foo' },
      setup: function(gulp, parameterized, result) {
        gulp.task('task', parameterized(function(_) {
          result(_.theParameters);
          _.done();
        }));
      },
      expected: { param: 'foo' },  
    }, cb);
  });

  it('provides params in second argument', function(cb) {
    testCallingTask({
      argv: { param: 'foo' },
      setup: function(gulp, parameterized, result) {
        gulp.task('task', parameterized(function(done, params) {
          result(params);
          done();
        }));
      },
      expected: { param: 'foo' },  
    }, cb);
  });

  it('accepts default params as object', function(cb) {
    testCallingTask({
      argv: { 'p2': 'v2', 'p3': 'v3' },
      setup: function(gulp, parameterized, result) {
        gulp.task('task', parameterized(function(done, params) {
          result(params);
          done();
        }, { p1: 'v1', p2: 'XXX' }));
      },
      expected: { p1: 'v1', p2: 'v2', p3: 'v3' },  
    }, cb);
  });

  it('accepts default params as array', function(cb) {
    testCallingTask({
      argv: { 'p2': 'v2', 'p3': 'v3' },
      setup: function(gulp, parameterized, result) {
        gulp.task('task', parameterized(function(done, params) {
          result(params);
          done();
        }, ['--p1', 'v1', '--p2', 'XXX']));
      },
      expected: { p1: 'v1', p2: 'v2', p3: 'v3' },  
    }, cb);
  });

  it('accepts default params as string', function(cb) {
    testCallingTask({
      argv: { 'p2': 'v2', 'p3': 'v3' },
      setup: function(gulp, parameterized, result) {
        gulp.task('task', parameterized(function(done, params) {
          result(params);
          done();
        }, '--p1 v1 --p2 XXX'));
      },
      expected: { p1: 'v1', p2: 'v2', p3: 'v3' },  
    }, cb);
  });

  it('accepts name and default params as object', function(cb) {
    testCallingTask({
      argv: { 'p2': 'v2', 'p3': 'v3' },
      setup: function(gulp, parameterized, result) {
        gulp.task(parameterized('task', function(done, params) {
          result(params);
          done();
        }, { p1: 'v1', p2: 'XXX' }));
      },
      expected: { p1: 'v1', p2: 'v2', p3: 'v3' },  
    }, cb);
  });

  it('accepts name and default params as array', function(cb) {
    testCallingTask({
      argv: { 'p2': 'v2', 'p3': 'v3' },
      setup: function(gulp, parameterized, result) {
        gulp.task(parameterized('task', function(done, params) {
          result(params);
          done();
        }, ['--p1', 'v1', '--p2', 'XXX']));
      },
      expected: { p1: 'v1', p2: 'v2', p3: 'v3' },  
    }, cb);
  });

  it('accepts name and default params as string', function(cb) {
    testCallingTask({
      argv: { 'p2': 'v2', 'p3': 'v3' },
      setup: function(gulp, parameterized, result) {
        gulp.task(parameterized('task', function(done, params) {
          result(params);
          done();
        }, '--p1 v1 --p2 XXX'));
      },
      expected: { p1: 'v1', p2: 'v2', p3: 'v3' },  
    }, cb);
  });

  it('can call another task with a name and params object', function(cb) {
    testCallingOtherTask({
      call: ['otherTask', { param1: 'foo', param2: 'bar' }],
      expected: { param1: 'foo', param2: 'bar' },
      callback: cb
    });
  });

  it('can call another task with a name and params array', function(cb) {
    testCallingOtherTask({
      call: ['otherTask', ['--param1', 'foo', '--param2', 'bar']],
      expected: { param1: 'foo', param2: 'bar' },
      callback: cb
    });
  });

  it('can call another task with a name and params string', function(cb) {
    testCallingOtherTask({
      call: ['otherTask', '--param1 foo --param2 bar'],
      expected: { param1: 'foo', param2: 'bar' },
      callback: cb
    });
  });

  it('can call another task with a params string', function(cb) {
    testCallingOtherTask({
      call: ['otherTask --param1 foo --param2 bar'],
      expected: { param1: 'foo', param2: 'bar' },
      callback: cb
    });
  });

  it('can call another task with a params string and object', function(cb) {
    testCallingOtherTask({
      call: ['otherTask --p1 foo --p2 bar', { p2: 'quux', p3: 'baz' }],
      expected: { p1: 'foo', p2: 'bar', p3: 'baz' },
      callback: cb
    });
  });

  it('can call another task with a params string and array', function(cb) {
    testCallingOtherTask({
      call: ['otherTask --p1 foo --p2 bar', ['--p2', 'quux', '--p3', 'baz']],
      expected: { p1: 'foo', p2: 'bar', p3: 'baz' },
      callback: cb
    });
  });

  it('can call another task with a params string and string', function(cb) {
    testCallingOtherTask({
      call: ['otherTask --p1 foo --p2 bar', '--p2 quux --p3 baz'],
      expected: { p1: 'foo', p2: 'bar', p3: 'baz' },
      callback: cb
    });
  });



  it('fails for invalid arguments', function(cb) {
    var gulp = requireUncached('gulp');
    var parameterized = requireUncached('./index.js');
    expect(parameterized.bind(null, 1, 1, 1)).to.throw(Error);
    expect(parameterized.bind(null, 1, 1)).to.throw(Error);
    expect(parameterized.bind(null, 1)).to.throw(Error);
    expect(parameterized.bind(null)).to.throw(Error);
    cb();
  });
});

['series', 'parallel'].forEach(function(composition) {
  function testCallingOtherTasks(config, cb) {
    var gulp = requireUncached('gulp');
    var parameterized = init({ argv: config.argv || {} });

    config.actual = {}; 

    gulp.task(parameterized('task1', function(done, params) {
      config.actual.task1 = params;
      done();
    }, config.defaults.task1));

    gulp.task(parameterized('task2', function(done, params) {
      config.actual.task2 = params;
      done();
    }, config.defaults.task2));

    gulp.task('task', config.task(function() {
      var args = Array.prototype.slice.call(arguments);
      return parameterized[composition].apply(parameterized, args);
    }));

    gulp.series('task')(function(err) {
      expect(config.actual).to.eql(config.expected);
      cb(err);
    });
  }

  describe('parameterized.' + composition + '()', function() {

/*       
param:   P1 P2 P3 P4 P5 P6 P7
-----------------------------
default: D1       D4    D6 D7
compose:    C2    C4 C5    C7
argv:          A3    A5 A6 A7
-----------------------------
         D1 C2 A3 C4 A5 A6 A7
*/

    it('can call other tasks by name', function(cb) {
      testCallingOtherTasks({
        defaults: {
          task1: {  },
          task2: { P1:'D1',                P4:'D4',        P6:'D6',P7:'D7' }, 
        }, 
        task: function(compose) {
          return compose('task1', 'task2');
        },
        argv:    {                 P3:'A3',        P5:'A5',P6:'A6',P7:'A7' },
        expected: {
          task1: {                 P3:'A3',        P5:'A5',P6:'A6',P7:'A7' },
          task2: { P1:'D1',        P3:'A3',P4:'D4',P5:'A5',P6:'A6',P7:'A7' },
        },
      }, cb);
    });

    it('can call other tasks by name and params object', function(cb) {
      testCallingOtherTasks({
        defaults: {
          task1:  {  },
          task2:  { P1:'D1',                P4:'D4',        P6:'D6',P7:'D7' }, 
        }, 
        task: function(compose) {
          var p = {         P2:'C2',        P4:'C4',P5:'C5',        P7:'C7' };
          return compose('task1', 'task2', p);
        },
        argv:     {                 P3:'A3',        P5:'A5',P6:'A6',P7:'A7' },
        expected: {
          task1:  {         P2:'C2',P3:'A3',P4:'C4',P5:'A5',P6:'A6',P7:'A7' },
          task2:  { P1:'D1',P2:'C2',P3:'A3',P4:'C4',P5:'A5',P6:'A6',P7:'A7' },
        },
      }, cb);
    });

    it('can call other tasks by name and params array', function(cb) {
      testCallingOtherTasks({
        defaults: {
          task1:  {  },
          task2:  { P1:'D1',                P4:'D4',        P6:'D6',P7:'D7' }, 
        }, 
        task: function(compose) {
          var p = [      '--P2','C2',    '--P4','C4','--P5','C5','--P7','C7'];
          return compose('task1', 'task2', p);
        },
        argv:     {                 P3:'A3',        P5:'A5',P6:'A6',P7:'A7' },
        expected: {
          task1:  {         P2:'C2',P3:'A3',P4:'C4',P5:'A5',P6:'A6',P7:'A7' },
          task2:  { P1:'D1',P2:'C2',P3:'A3',P4:'C4',P5:'A5',P6:'A6',P7:'A7' },
        },
      }, cb);
    });
 
    it('can call other tasks by params string', function(cb) {
      testCallingOtherTasks({
        defaults: {
          task1:  {  },
          task2:  { P1:'D1',                P4:'D4',        P6:'D6',P7:'D7' }, 
        }, 
        task: function(compose) {
          return compose('task1 --P2 C2 --P4 C4 --P5 C5 --P7 C7',
                         'task2 --P2 C2 --P4 C4 --P5 C5 --P7 C7');
        },
        argv:     {                 P3:'A3',        P5:'A5',P6:'A6',P7:'A7' },
        expected: {
          task1:  {         P2:'C2',P3:'A3',P4:'C4',P5:'A5',P6:'A6',P7:'A7' },
          task2:  { P1:'D1',P2:'C2',P3:'A3',P4:'C4',P5:'A5',P6:'A6',P7:'A7' },
        },
      }, cb);
    });

    it('can call other tasks by params string and params object', function(cb) {
      testCallingOtherTasks({
        defaults: {
          task1:  {  },
          task2:  { P1:'D1',                P4:'D4',        P6:'D6',P7:'D7' }, 
        }, 
        task: function(compose) {
          return compose('task1 --P2 C2         --P5 C5 --P7 C7',
                         'task2 --P2 C2 --P4 C4 --P5 C5 --P7 C7',
                         { P4:'X4' });
        },
        argv:     {                 P3:'A3',        P5:'A5',P6:'A6',P7:'A7' },
        expected: {
          task1:  {         P2:'C2',P3:'A3',P4:'X4',P5:'A5',P6:'A6',P7:'A7' },
          task2:  { P1:'D1',P2:'C2',P3:'A3',P4:'C4',P5:'A5',P6:'A6',P7:'A7' },
        },
      }, cb);
    });

    it('can call other tasks by params string and params array', function(cb) {
      testCallingOtherTasks({
        defaults: {
          task1:  {  },
          task2:  { P1:'D1',                P4:'D4',        P6:'D6',P7:'D7' }, 
        }, 
        task: function(compose) {
          return compose('task1 --P2 C2         --P5 C5 --P7 C7',
                         'task2 --P2 C2 --P4 C4 --P5 C5 --P7 C7',
                         ['--P4', 'X4']);
        },
        argv:     {                 P3:'A3',        P5:'A5',P6:'A6',P7:'A7' },
        expected: {
          task1:  {         P2:'C2',P3:'A3',P4:'X4',P5:'A5',P6:'A6',P7:'A7' },
          task2:  { P1:'D1',P2:'C2',P3:'A3',P4:'C4',P5:'A5',P6:'A6',P7:'A7' },
        },
      }, cb);

    });

  });
});
