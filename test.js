'use strict';

/* global describe:false, it:false */

var chai = require('chai');
var expect = chai.expect;

function requireUncached(mod) {
  delete require.cache[require.resolve(mod)];
  return require(mod);
}

function init(opts) {
  opts = opts || { argv: {} };
  return requireUncached('./index.js').withOptions(opts);
}

function testCallingTask(config) {
  var parameterized = init({ argv: config.argv || {} });
  var gulp = requireUncached('gulp');

  function resultCallback(r) { config.actual = r; }

  config.setup(gulp, parameterized, resultCallback);

  gulp.series('task')(function() {
    expect(config.actual).to.eql(config.expected);
    config.callback();
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
      callback: cb
    });
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
      callback: cb
    });
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
      callback: cb
    });
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
      callback: cb
    });
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
      callback: cb
    });
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
      callback: cb
    });
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
      callback: cb
    });
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
      callback: cb
    });
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
      callback: cb
    });
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
      callback: cb
    });
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
