var path = require('path');
var findup = require('../../libs/fs/findup');
var addEnvPath = require('../../libs/sys/addEnvPath');
var shell = require('../../libs/tty/shell');
var assign = require('../../libs/lang/assign');
var exists = require('../../libs/fs/exists');

var root, pkgFile, pkg;

module.exports = function (dir, alias) {
  pkgFile = findup.pkg(dir);
  pkg = require(pkgFile);
  root = path.dirname(pkgFile);

  var hooks = pkg.config && pkg.config.hooks;
  var cmd = hooks && hooks[alias], env;
  if (typeof cmd === 'object') cmd = cmd.command || cmd.cmd;
  if (cmd) {
    if (cmd === true) {
      cmd = path.resolve(__dirname, '..', alias + '.js')
      if (!exists(cmd)) {
        throw new Error('File ' + cmd + ' not exists, can not set config.hooks.' + alias + ' to true');
      }
    }

    cmd = replaceCommandArgv(cmd);
    env = assign({}, process.env);
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

