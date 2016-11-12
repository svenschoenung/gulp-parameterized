function requireGulp() {
  try {
    return require('gulp');
  } catch (e) {
console.log(e);
    return null;
  }
}

module.exports = requireGulp;
