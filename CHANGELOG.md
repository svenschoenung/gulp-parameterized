# Changelog

## v0.1.0 (2016-11-27)

**Features**
- Added `paramsName` and `callbackName` options
- Show error message when requiring of gulp instance fails
- Show warning message when requiring of gulp metadata instance fails

**Bugfixes**
- Fixed the order in which params are merged. Params that are specified later should take precedence over params that were specified earlier. The order is therefore: command line params > `series()` and `parallel()` params > task default params

**Documentation**
- Rewrote README to give a better introduction to accepting and passing parameters
- Formatting fixes

**Tests**
- Added tests for `parameterized.series()` and `parameterized.parallel()`
- Added tests for `parameterized` options
- Refactored existing tests

## v0.0.3 (2016-11-23)

**Bugfixes**
- Fixed issue where params in `parameterized.task('task --param val')` were not correctly parsed

**Documentation**
- Minor formatting changes

**Tests**
- Introduced tests for `parameterized.task()`

## v0.0.2 (2016-11-15)

**Bugfixes**

- Generate metadata for functions returned by `parameterized.series()` and `parameterized.parallel()` so that `gulp --tasks` can display a task tree

**Documentation**

- Added `CHANGLELOG.md`
- Fixed some typoes

## v0.0.1 (2016-11-13)

**Initial release**

- Define parameterized tasks with `parameterized.task()`
- Combine parameterized tasks with `parameterized.series()` and `parameterized.parallel()`
- Parse command line arguments with `yargs`

