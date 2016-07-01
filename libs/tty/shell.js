// 参考 npm package: spawn-command@0.0.2  execa@0.4.0

var spawn = require('child_process').spawn
var assign = require('./../lang/assign')

module.exports = function (command, options) {
  options = options || {}

  var file, args
  if (process.platform === 'win32') {
    file = 'cmd.exe'
    args = ['/s', '/c', '"' + command + '"']
    options = assign({}, options)

    // Tell node's spawn that the arguments are already escaped
    options.windowsVerbatimArguments = true
  } else {
    file = '/bin/sh'
    args = ['-c', command]
  }

  return spawn(file, args, options)
}
