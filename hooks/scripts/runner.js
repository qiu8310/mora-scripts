var path = require('path');
var findup = require('../../libs/findup');
var addEnvPath = require('../../libs/addEnvPath');
var shell = require('../../libs/shell');

var root, pkgFile, pkg;

module.exports = function (dir, alias) {
  pkgFile = findup.pkg(dir);
  pkg = require(pkgFile);
  root = path.dirname(pkgFile);

  var hooks = pkg.config && pkg.config.hooks;
  var cmd = hooks[alias], env;
  if (typeof cmd === 'object') cmd = cmd.command || cmd.cmd;
  if (cmd) {
    cmd = replaceCommandArgv(cmd);
    env = clone(process.env);
    addEnvPath(env, path.join(root, 'node_modules', '.bin'));
    shell(cmd, {stdio: 'inherit', env: env}).on('exit', process.exit);
  }
}


function replaceCommandArgv(cmd) {
  return cmd
      // replace any instance of $1 or $2 etc. to that item as an process.argv
      .replace(/\$(\d)/g, function (raw, index) {
        return process.argv[index];
      })
      .replace(/~/g, function () {
        return path.join(root, 'node_modules');
      });
}

function clone(obj) {
  var k, r = {};
  for (k in obj) {
    r[k] = obj[k];
  }
  return r;
}
