/* jshint node: true */
'use strict';

/**
  # stylify

  browserify v2 plugin for [stylus](https://github.com/LearnBoost/stylus).

  ## Example Usage

  Usage is very simple when combined with the
  [insert-css](https://github.com/substack/insert-css) (or similar) module.
  Consider the following example, which dynamically creates a couple of
  div tags, and dynamically assigned styles:

  <<< examples/simple.js

  You can see the final statement uses a familar node `require` call to 
  bring in a stylus stylesheet:

  <<<css examples/simple.styl

**/

var stylus = require('stylus');
var cleanCss = require('clean-css');
var through = require('through');

function compile(file, data, opts) {
  opts = opts || opts;
  if (typeof opts.minify === "undefined") opts.minify = true;

  var compiler = stylus(data, {
    filename: file,
    linenos: opts.linenos,
    compress: opts.compress,
    firebug: opts.firebug
  });

  // Allow full control of the compiler object. Can be used to activate nib for
  // example
  if (typeof opts.configure === "function") {
    opts.configure(compiler);
  }

  var css = compiler.render();

  if (opts.minify) css = (new cleanCss).minify(css);

  return 'module.exports = ' + JSON.stringify(css) + ';';
}

module.exports = function (file, opts) {
  var data = '';

  function write (buf) {
    data += buf;
  }

  function end () {
    this.queue(compile(file, data, opts));
    this.queue(null);
  }

  if (!/\.styl$/.test(file)) return through();

  return through(write, end);
};
