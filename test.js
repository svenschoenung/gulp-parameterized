'use strict';

/* global describe:false, it:false */

var chai = require('chai');
var expect = chai.expect;

function requireUncached(mod) {
  delete require.cache[require.resolve(mod)];
  return require(mod);
}

describe('parameterized.task()', function() {

  it('provides regular callback', function(testDone) {
    var gulp = requireUncached('gulp');
    var parameterized = requireUncached('./index.js');
    var taskExecuted = false;
    gulp.task('task1', parameterized(function(done) {
      taskExecuted = true;
      done();
    }));
    gulp.series('task1')(function() {
      expect(taskExecuted).to.equal(true);
      testDone();
    });
  });

  it('provides _.done() callback', function(testDone) {
    var gulp = requireUncached('gulp');
    var parameterized = requireUncached('./index.js');
    var taskExecuted = false;
    gulp.task('task2', parameterized(function(_) {
      taskExecuted = true;
      _.done();
    }));
    gulp.series('task2')(function() {
      expect(taskExecuted).to.equal(true);
      testDone();
    });
  });

  it('provides parsed command line params in _.params', function(done) {
    var gulp = requireUncached('gulp');
    var parameterized = requireUncached('./index.js').withOptions({
      argv: { 'param': 'foo' }
    });
    var providedParams;
    gulp.task('task3', parameterized(function(_) {
      providedParams = _.params;
      _.done();
    }));
    gulp.series('task3')(function() {
      expect(providedParams).to.eql({ param: 'foo'});
      done();
    });
  });

  it('provides parsed command line params in second argument', function(testDone) {
    var gulp = requireUncached('gulp');
    var parameterized = requireUncached('./index.js').withOptions({
      argv: { 'param': 'foo' }
    });
    var providedParams;
    gulp.task('task4', parameterized(function(done, params) {
      providedParams = params;
      done();
    }));
    gulp.series('task4')(function() {
      expect(providedParams).to.eql({ param: 'foo'});
      testDone();
    });
  });

  it('accepts default params that can be overwritten by command line params', function(testDone) {
    var gulp = requireUncached('gulp');
    var parameterized = requireUncached('./index.js').withOptions({
      argv: { 'param2': 'baz', 'param3': 'quux' }
    });
    var providedParams;
    gulp.task('task5', parameterized(function(done, params) {
      providedParams = params;
      done();
    }, { param1: 'foo', param2: 'bar' }));
    gulp.series('task5')(function() {
      expect(providedParams).to.eql({
        param1: 'foo',
        param2: 'baz',
        param3: 'quux'
      });
      testDone();
    });
  });

  it('accepts default params that can be overwritten by command line params', function(testDone) {
    var gulp = requireUncached('gulp');
    var parameterized = requireUncached('./index.js').withOptions({
      argv: { 'param2': 'baz', 'param3': 'quux' }
    });
    var providedParams;
    gulp.task('task5', parameterized(function(done, params) {
      providedParams = params;
      done();
    }, { param1: 'foo', param2: 'bar' }));
    gulp.series('task5')(function() {
      expect(providedParams).to.eql({
        param1: 'foo',
        param2: 'baz',
        param3: 'quux'
      });
      testDone();
    });
  });

  it('accepts a name and default params', function(testDone) {
    var gulp = requireUncached('gulp');
    var parameterized = requireUncached('./index.js').withOptions({
      argv: { 'param2': 'baz', 'param3': 'quux' }
    });
    var providedParams;
    gulp.task(parameterized('task6', function(done, params) {
      providedParams = params;
      done();
    }, { param1: 'foo', param2: 'bar' }));
    gulp.series('task6')(function() {
      expect(providedParams).to.eql({
        param1: 'foo',
        param2: 'baz',
        param3: 'quux'
      });
      testDone();
    });
  });

  it('accepts a name and default params', function(testDone) {
    var gulp = requireUncached('gulp');
    var parameterized = requireUncached('./index.js');
    var taskExecuted = false;
    gulp.task(parameterized('task7', function(done, params) {
      taskExecuted = true;
      done();
    }));
    gulp.series('task7')(function() {
      expect(taskExecuted).to.equal(true);
      testDone();
    });
  });

  it('can call another task with a name and params object', function(testDone) {
    var gulp = requireUncached('gulp');
    var parameterized = requireUncached('./index.js').withOptions({
      argv: {}
    });
    var providedParams; 
    gulp.task(parameterized('task8', function(done, params) {
      providedParams = params;
      done();
    }));
    gulp.task('task9', parameterized('task8', {
      param1: 'foo', param2: 'bar'
    }));
    gulp.series('task9')(function() {
      expect(providedParams).to.eql({ param1: 'foo', param2: 'bar' });
      testDone();
    });
  });

  it('can call another task with a name and params array', function(testDone) {
    var gulp = requireUncached('gulp');
    var parameterized = requireUncached('./index.js').withOptions({
      argv: {}
    });
    var providedParams; 
    gulp.task(parameterized('task10', function(done, params) {
      providedParams = params;
      done();
    }));
    gulp.task('task11', parameterized('task10', [
      '--param1', 'foo', '--param2', 'bar'
    ]));
    gulp.series('task11')(function() {
      delete providedParams['_'];
      delete providedParams['$0'];
      expect(providedParams).to.eql({ param1: 'foo', param2: 'bar' });
      testDone();
    });
  });

  it('can call another task with a name and and params string', function(testDone) {
    var gulp = requireUncached('gulp');
    var parameterized = requireUncached('./index.js').withOptions({
      argv: {}
    });
    var providedParams; 
    gulp.task(parameterized('task12', function(done, params) {
      providedParams = params;
      done();
    }));
    gulp.task('task13', parameterized('task12', '--param1 foo --param2 bar'));
    gulp.series('task13')(function() {
      delete providedParams['_'];
      delete providedParams['$0'];
      expect(providedParams).to.eql({ param1: 'foo', param2: 'bar' });
      testDone();
    });
  });

  it('can call another task with a single params string', function(testDone) {
    var gulp = requireUncached('gulp');
    var parameterized = requireUncached('./index.js').withOptions({
      argv: {}
    });
    var providedParams; 
    gulp.task(parameterized('task10', function(done, params) {
      providedParams = params;
      done();
    }));
    gulp.task('task11', parameterized('task10 --param1 foo --param2 bar'));
    gulp.series('task11')(function() {
      delete providedParams['_'];
      delete providedParams['$0'];
      expect(providedParams).to.eql({ param1: 'foo', param2: 'bar' });
      testDone();
    });
  });

  it('fails for invalid arguments', function(testDone) {
    var gulp = requireUncached('gulp');
    var parameterized = requireUncached('./index.js');
    expect(parameterized.bind(null, 1, 1, 1)).to.throw(Error);
    expect(parameterized.bind(null, 1, 1)).to.throw(Error);
    expect(parameterized.bind(null, 1)).to.throw(Error);
    expect(parameterized.bind(null)).to.throw(Error);
    testDone();
  });


});
