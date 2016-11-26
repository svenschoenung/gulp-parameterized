var gutil = require('gulp-util');
var fs = require('fs');

function requireGulp(config) {
  try {

    var req = config._require || require;
    return req('gulp');

  } catch (e) {

    function log(msg) {
      config.log(gutil.colors.red(msg));
    }
  
    log('Fatal error in gulp-parameterized:');
    log('');
    log('  Couldn\'t require the gulp instance.');
    log('');
    log('You might have to pass the gulp instance explicitly like this:')
    log('');
    log('  var gulp = require(\'gulp\');');
    log('  var parameterized = require(\'gulp-parameterized\');');
    log('  parameterized = parameterized.withGulp(gulp);');
    log('');
    log('Aborting, because there\'s nothing we can do.');
  
    var error = new gutil.PluginError(
      'gulp-parameterized', 
      'Couldn\'t require the gulp instance.'
    );
    error.showStack = false;
    throw error;
  }
}

module.exports = requireGulp;
