# Changelog

## v0.0.3 (2016-11-23)

**Bugfixes**
- Fixed issue where params in `parameterized.task('task --param val')` were not correctly parsed

**Documentation**
- Minor formatting changes

**Tests**
- Introduced tests for parameterized.task()

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

