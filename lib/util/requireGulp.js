function requireGulp() {
  try {
    return require('gulp'); //eslint-disable-line global-require
  } catch (e) {
    return null;
  }
}

module.exports = requireGulp;
