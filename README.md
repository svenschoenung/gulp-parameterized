[![npm Version](https://img.shields.io/npm/v/gulp-parameterized.svg)](https://www.npmjs.com/package/gulp-parameterized)
[![Build Status](https://travis-ci.org/svenschoenung/gulp-parameterized.svg?branch=master)](https://travis-ci.org/svenschoenung/gulp-parameterized)
[![Coverage Status](https://coveralls.io/repos/github/svenschoenung/gulp-parameterized/badge.svg?branch=master)](https://coveralls.io/github/svenschoenung/gulp-parameterized?branch=master)
[![Dependency Status](https://david-dm.org/svenschoenung/gulp-parameterized.svg)](https://david-dm.org/svenschoenung/gulp-parameterized)
[![devDependency Status](https://david-dm.org/svenschoenung/gulp-parameterized/dev-status.svg)](https://david-dm.org/svenschoenung/gulp-parameterized#info=devDependencies)
[![Code Climate](https://codeclimate.com/github/svenschoenung/gulp-parameterized/badges/gpa.svg)](https://codeclimate.com/github/svenschoenung/gulp-parameterized)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/5309f1912ff345e1b51bca85615bd25d)](https://www.codacy.com/app/svenschoenung/gulp-parameterized)

# gulp-parameterized

Parameterize gulp tasks.

**NOTE: REQUIRES GULP 4.0**

## Installation

    npm install --save-dev gulp-parameterized

## Example

One often encountered use case is to generate separate **development** and **production** builds where only the production build should be deployed to the server.

We can use `gulp-parameterized` to parameterize the `build` task with a `--production` flag:

```JavaScript
    var gulp = require('gulp');
    var parameterized = require('gulp-parameterized');
    
    gulp.task('build', parameterized(function(_) {
      if (_.params.production) {
        /* do a production build */
        return gulp.src('src/*.js').pipe(...);
      } else {
        /* do a development build */
        return gulp.src('src/*.js').pipe(...);
      }
    }));

    gulp.task('deploy', parameterized.series('build --production', function(cb) {
      /* copy to server */
      cb();
    }));
```

Now running any of the following commands will generate a **production** build:

    $ gulp build --production
    $ gulp deploy
    
Wheras running any of the following commands will generate a **development** build:

    $ gulp build
    $ gulp build --no-production

## License

[MIT](LICENSE)
