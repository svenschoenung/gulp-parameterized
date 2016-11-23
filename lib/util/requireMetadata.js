
function tryRequire(mod) {
  try {
    return require(mod); //eslint-disable-line global-require
  } catch (e) {
    return null;
  }
}

function requireMetadata() {
  return tryRequire('gulp/node_modules/undertaker/lib/helpers/metadata.js') ||
         tryRequire('undertaker/lib/helpers/metadata.js') ||
    {
      set: function() { },
      get: function() { }
    };
}

module.exports = requireMetadata();
