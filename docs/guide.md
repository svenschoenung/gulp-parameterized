# User Guide

* [Installation and usage](#installation-and-usage)
* [Parameterizing a task](#parameterizing-a-task)
  * [Accepting parameters in a task](#accepting-parameters-in-a-task)
    * [Second-argument style and single-argument style](#second-argument-style-and-single-argument-style)
    * [Using parameter injection](#using-parameter-injection)
  * [Specifying default parameters](#specifying-default-parameters)
* [Passing parameters to a task](#passing-parameters-to-a-task)
  * [Passing parameters from the command line](#passing-parameters-from-the-command-line)
  * [Passing parameters from other tasks](#passing-parameters-from-other-tasks)

## Installation and usage

Installing `gulp-parameterized` is done as it normaly is, through `npm`:

```
npm install --save-dev gulp-parameterized
```

After `gulp-paramterized` is installed you can require it in your gulpfile:

```javascript
var parameterized = require('gulp-parameterized');
```

In most cases that's all there is to it. When you require the 
`gulp-parameterized` instance it will automatically access the locally
installed gulp instance, meaning you won't have to do anything.

If for some reason this doesn't work and gulp cannot be loaded you
can still explicitly pass an instance of gulp to `gulp-parameterized`:

```javascript
var gulp = require('gulp');
var parameterized = require('gulp-parameterized').withGulp(gulp);
```

Besides the gulp instance you can also pass 
a variety of options to `gulp-parameterized` using `withOptions()`:

```javascript
var parameterized = require('gulp-parameterized').withOptions({
  callbackName: 'cb',
  paramsName: 'params'
});
```

See the [API documentation]() for a list of all available options.

## Parameterizing a task

Once you've successfully installed and initialized the `parameterized` object
you can start parameterizing tasks.

First of all any task function that should be able to receive parameters must
be wrapped by `parameterized.task()`:

```javascript
gulp.task('hello', parameterized.task(function(cb, params) {
console.log('hello ' + params.name + '!');
cb();
}));
```

This returns a new `function(cb)` that takes care of the job of parameter
parsing, but otherwise behaves just like any other function.

If you want to save a little bit of typing you can shorten
`parameterized.task()` to simply `parameterized()`:

```javascript
gulp.task('hello', parameterized(function(cb, params) {
console.log('hello ' + params.name + '!');
cb();
}));
```

Both variations for parameterizing tasks are identical. We will be using the
shorter one throughout this guide.

### Accepting parameters in a task

Regular non-parameterized gulp tasks can take exactly one argument: a
callback function (usually named `done` or `cb`) that is used to signal
[async completion](https://github.com/gulpjs/gulp/blob/4.0/docs/API.md#async-support)
back to gulp. Any other arguments a task function may
declare remain unused and will be `undefined` when the task runs.

Parameterized gulp tasks on the other hand need access to the callback
function *and* a way to access the provided parameters. And they need to do
this in a way that still keeps them compatible with regular gulp tasks. 

There's different approaches to achieve this, all of them with their own
advantages and disadvantages. We therefore offer three ways to accept
parameters in a task function. They are:

1. Second-argument style
2. Single-argument style
3. Parameter injection

The third method, parameter injection, is significantly different from the
other two, so it will be discussed separately. The first two are best
explained together.

### Second-argument style and single-argument style

These are the default styles of parameter acceptance. You don't need to do
anything to enable them and you can mix them throughout your gulpfile: some of
your tasks can use one style and the rest of your tasks can use the other style.

Both styles provide task functions with two things: the callback function and
a parameter object. The only difference is in the way both styles give you 
access to those two things.

In the **second-argument style** the parameter object is passed as the
second argument in your task function. The first argument is the callback
function, just as it is in regular non-parameterized gulp tasks:

```javascript
gulp.task('hello', parameterized(function(cb, params) {
console.log('hello ' + params.name + '!'); 
cb();
}));
```

Any parameters that you pass on the command line or from other tasks will be
available as part of the `params` object (see [Passing arguments]()).

> ⚠  Warning: You *cannot* simply leave out the callback function. Even
> if you don't actually need it in your task because you are, e.g., using
> a stream. The following *won't* work:
> 
> ```
> gulp.task('copy', parameterized(function(params) { // WRONG!
>   return gulp.src(params.file)
>     .pipe(gulp.dest('dist'));
> }));
> ```
>
> You *have to* declare the `cb` argument:
>
> ```javascript
> gulp.task('copy', parameterized(function(cb, params) {
>   return gulp.src(params.file)
>     .pipe(gulp.dest('dist'));
> }));
> ```
>
> As long as you use 
> [one of the other ways](https://github.com/gulpjs/gulp/blob/4.0/docs/API.md#async-support)
> of signalling async completion, gulp will ignore the fact
> that you have declared an unused callback function.

In the **single-argument style** you only declare a single argument in your
task function. We will simply name this argument `_`, but any other name will
do as well. You can then access the callback function as `_.cb()` and the
parameter object as `_.params`:

```javascript
gulp.task('hello', parameterized(function(_) {
console.log('hello ' + _.params.name + '!'); 
_.cb();
}));
```

> 💡 Hint: Instead of `_.cb()` you can also use `_.done()` or `_.callback()`.
> You can specify a custom name for the callback function using the 
> `callbackName` option.  
> 
> 💡 Hint: Instead of `_.params` you can also use  `_.parameters`. You can 
> specify a custom name for the parameter object using the `paramsName`
> option.   

Having a single argument works out well if you don't actually need
the callback function, only the parameter object:

```javascript
gulp.task('copy', parameterized(function(_) {
return gulp.src(_.params.file)
.pipe(gulp.dest('dist'));
}));
```

Which one of these two styles you choose will come down to personal
preference. Both of them have the advantage of not breaking any of the 
regular semantics for gulp tasks. That means you should be able to 
pass any function to `parameterized()` that you would normally pass to 
`gulp.task()` and it should *just work*.

### Using parameter injection

### Specifying default parameters

## Passing parameters to a task

### Passing parameters from the command line

### Passing parameters from other tasks


