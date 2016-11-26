var gutil = require('gulp-util');

function tryRequire(mod) {
  try {
    return require(mod); //eslint-disable-line global-require
  } catch (e) {
    return null;
  }
}

var showedWarning = false;
function showWarning(config) {
  if (showedWarning) {
    return;
  }

  function log(msg) {
    config.log(gutil.colors.yellow(msg));
  }

  log('Warning: gulp-parameterized could not access gulp metadata.');
  log('The gulp --tasks command line flag will not be fully functional when');
  log('listing parameterized tasks, but everything else should be fine.');

  showedWarning = true;
}

function mockMetadata(config) {
  showWarning(config);

  return {
    set: function() { },
    get: function() { }
  };
}

function requireMetadata(config) {
  var req = config._require || tryRequire;
  
  return req('gulp/node_modules/undertaker/lib/helpers/metadata.js') ||
         req('undertaker/lib/helpers/metadata.js') ||
         mockMetadata(config);
}

module.exports = requireMetadata;
