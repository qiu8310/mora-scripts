#!/usr/bin/env node

var path = require('path');
var spawn = require('cross-spawn');
var assign = require('../libs/assign');
var findup = require('../libs/findup');
var dotProp = require('../libs/dotProp');
var addEnvPath = require('../libs/addEnvPath');
var escapeRegExp = require('../libs/escapeRegExp');
var warn = require('../libs/warn');

var pkgFile = findup.pkg();
var rootDir = path.dirname(pkgFile);

var pkg = require(pkgFile);
var reEnvArg = /^(\w+)=(?:'(.+)'|"(.+)"|(.+))$/;
var rePkgArg, rePkgArgs, pkgPrefixLength;

var env = assign({}, process.env), cmd, args = [];

addEnvPath(env, path.join(rootDir, 'node_modules', '.bin'))
addEnvPath(env, path.join(rootDir, 'bin'))
buildPkgRe('pkg')

var ignoreNext;
process.argv.slice(2).map(function (arg, i, all) {
  if (ignoreNext) {
    ignoreNext = false;
    return ;
  }

  if (reEnvArg.test(arg)) {
    env[RegExp.$1] = RegExp.$2 || RegExp.$3 || RegExp.$4
  } else if (rePkgArg.test(arg)) {
    var pkgVal = dotProp(pkg, RegExp.$_.substr(pkgPrefixLength));
    args.push(recursiveRepalcePkgArgs(pkgVal))
  } else if (arg[0] !== '-' && !cmd) {
    cmd = arg
  } else {
    // 这个参数只是给 cli/run.js 用的，所以要放在 cmd 前端
    if (arg === '--prefix' && !cmd && all[i + 1]) {
      ignoreNext = true;
      buildPkgRe(all[i + 1]);
    } else {
      args.push(arg)
    }
  }
})

if (cmd) spawn(cmd, args, {stdio: 'inherit', env: env})
else warn('No command to run with !')

function recursiveRepalcePkgArgs(str) {
  if (str == null) return '';
  return str.replace(rePkgArgs, function (raw) {
    return recursiveRepalcePkgArgs(dotProp(pkg, raw.substr(pkgPrefixLength)));
  });
}

function buildPkgRe(prefix) {
  if (!prefix) return ;
  pkgPrefixLength = prefix.length + 1; // 1 is for the next character "."
  prefix = escapeRegExp(prefix)

  // rePkgArg = /^pkg(?:\.[\w-]+)+$/;
  // rePkgArgs = /\bpkg(?:\.[\w-]+)+\b/g;
  rePkgArg = new RegExp('^' + prefix + '(?:\\.[\\w-]+)+$')
  rePkgArgs = new RegExp('\\b' + prefix + '(?:\\.[\\w-]+)+\\b' ,'g')
}
