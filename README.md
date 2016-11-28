[![npm Version](https://img.shields.io/npm/v/gulp-parameterized.svg)](https://www.npmjs.com/package/gulp-parameterized)
[![Build Status](https://travis-ci.org/svenschoenung/gulp-parameterized.svg?branch=master)](https://travis-ci.org/svenschoenung/gulp-parameterized)
[![Coverage Status](https://coveralls.io/repos/github/svenschoenung/gulp-parameterized/badge.svg?branch=master)](https://coveralls.io/github/svenschoenung/gulp-parameterized?branch=master)
[![Dependency Status](https://david-dm.org/svenschoenung/gulp-parameterized.svg)](https://david-dm.org/svenschoenung/gulp-parameterized)
[![devDependency Status](https://david-dm.org/svenschoenung/gulp-parameterized/dev-status.svg)](https://david-dm.org/svenschoenung/gulp-parameterized#info=devDependencies) [![Code Climate](https://codeclimate.com/github/svenschoenung/gulp-parameterized/badges/gpa.svg)](https://codeclimate.com/github/svenschoenung/gulp-parameterized)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/5309f1912ff345e1b51bca85615bd25d)](https://www.codacy.com/app/svenschoenung/gulp-parameterized)

# gulp-parameterized

Parameterize gulp tasks.

**NOTE: REQUIRES GULP 4.0**

See [CHANGELOG](CHANGELOG.md) for latest changes.

## Installation

```
npm install --save-dev gulp-parameterized
```

## Usage

You can accept parameters in a task by wrapping the task function in `parameterized()`:

```javascript
var parameterized = require('gulp-parameterized');

gulp.task('hello', parameterized(function(cb, params) {
  console.log('hello ' + params.name + '!');
  cb();
}));
```

You can then pass parameters to a task on the command line:

```
$ gulp hello --name world
[23:43:51] Using gulpfile ~/hello-example/gulpfile.js
[23:43:51] Starting 'hello'...
hello world!
[23:43:51] Finished 'hello' after 1.98 ms
```

Use `parameterized.series()` and `parameterized.parallel()` instead of `gulp.series()` and `gulp.parallel()` if you want to call another task in your gulpfile and pass parameters to it:

```javascript
gulp.task('hello-world', parameterized.series('hello --name world'));

gulp.task('hello-gulp', parameterized.series('hello --name gulp'));
```

You can then invoke the `hello-gulp` task on the command line:

```
$ gulp hello-gulp
[23:49:38] Using gulpfile ~/hello-example/gulpfile.js
[23:49:38] Starting 'hello-gulp'...
[23:49:38] Starting 'hello'...
hello gulp!
[23:49:38] Finished 'hello' after 1.28 ms
[23:49:38] Finished 'hello-gulp' after 4.91 ms
```

## License

[MIT](LICENSE)
