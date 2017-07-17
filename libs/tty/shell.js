/**
 * @module      libs/tty/shell
 * @createdAt   2016-07-18
 *
 * @copyright   Copyright (c) 2016 Zhonglei Qiu
 * @license     Licensed under the MIT license.
 */

var cp = require('child_process')
var assign = require('../lang/assign')
var isWin = require('../sys/isWin')

/**
 * 运行指定的命令
 *
 * @param  {String} command 要运行的命令
 * @param  {Object} [options] 配置选项，支持所有 child_process.spawn 的选项
 * @return {ChildProcess}
 *
 * @see    [spawn-command@0.0.2]{@link https://github.com/mmalecki/spawn-command/tree/v0.0.2}
 * @see    [execa@0.4.0]{@link https://github.com/sindresorhus/execa/tree/v0.4.0}
 *
 * @example
 * shell('ls some_dir')
 * shell('ps aux')
 *
 * @since 2.0.0
 * @author Zhonglei Qiu
 */
module.exports = function(command, options) {
  options = options || {}

  var file, args
  if (isWin) {
    file = 'cmd.exe'
    args = ['/s', '/c', '"' + command + '"']
    options = assign({}, options)

    // Tell node's spawn that the arguments are already escaped
    options.windowsVerbatimArguments = true
  } else {
    file = '/bin/sh'
    args = ['-c', command]
  }

  return cp.spawn(file, args, options)
}

module.exports.promise = function(command, options) {
  return new Promise(function(resolve, reject) {
    module.exports(command, options || {stdio: 'inherit'})
      .on('close', function(code) {
        if (code) reject(code)
        else resolve(code)
      })
  })
}
