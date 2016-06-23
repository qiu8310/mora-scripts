#!/usr/bin/env node

var spawn = require('cross-spawn');
var assign = require('../libs/assign');
var findup = require('../libs/findup');
var dotProp = require('../libs/dot-prop');
var warn = require('../libs/warn');

var pkg = require(findup.pkg());
var reEnvArg = /^(\w+)=(?:'(.+)'|"(.+)"|(.+))$/;
var rePkgArg = /^pkg(?:\.[\w-]+)+$/;
var rePkgArgs = /\bpkg(?:\.[\w-]+)+\b/g;

var env = assign({}, process.env), cmd, args = [];

process.argv.slice(2).map(function (arg) {
  if (reEnvArg.test(arg)) {
    env[RegExp.$1] = RegExp.$2 || RegExp.$3 || RegExp.$4
  } else if (rePkgArg.test(arg)) {
    var pkgVal = dotProp(pkg, RegExp.$_.substr(4));
    args.push(recursiveRepalcePkgArgs(pkgVal))
  } else if (arg[0] !== '-' && !cmd) {
    cmd = arg
  } else {
    args.push(arg)
  }
})

if (cmd) spawn(cmd, args, {stdio: 'inherit', env: env})
else warn('No command to run with !')

function recursiveRepalcePkgArgs(str) {
  if (str == null) return '';
  return str.replace(rePkgArgs, function (raw) {
    return recursiveRepalcePkgArgs(dotProp(pkg, raw.substr(4)));
  });
}
