var path = require('path')
var findup = require('../../libs/fs/findup')
var addEnvPath = require('../../libs/sys/addEnvPath')
var shell = require('../../libs/tty/shell')
var assign = require('../../libs/lang/assign')
var exists = require('../../libs/fs/exists')

module.exports = function(dir, alias) {
  var pkgFile
  try {
    pkgFile = findup.pkg(dir)
  } catch (e) {
    // 找不到 package.json 文件，则不需要执行任何操作
    return
  }

  var pkg = require(pkgFile)
  var root = path.dirname(pkgFile)

  var hooks = pkg.config && pkg.config.hooks
  var cmd = hooks && hooks[alias]
  var env

  if (typeof cmd === 'object') cmd = cmd.command || cmd.cmd
  if (cmd) {
    if (cmd === true) {
      cmd = path.resolve(__dirname, '..', alias + '.js')
      if (!exists(cmd)) {
        throw new Error('File ' + cmd + ' not exists, can not set config.hooks.' + alias + ' to true')
      }
    }

    cmd = replaceCommandArgv(cmd, root)
    env = assign({}, process.env)
    addEnvPath(env, path.join(root, 'node_modules', '.bin'))
    shell(cmd, {stdio: 'inherit', env: env}).on('exit', process.exit)
  }
}

function replaceCommandArgv(cmd, root) {
  return cmd
      // replace any instance of $1 or $2 etc. to that item as an process.argv
      .replace(/\$(\d)/g, function(raw, index) {
        return process.argv[index]
      })
      .replace(/~/g, function() {
        return path.join(root, 'node_modules')
      })
}

