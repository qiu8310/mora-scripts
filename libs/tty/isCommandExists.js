/**
 *
 * 基于 npm 模块 command-exists 改写的
 *
 * @module      libs/tty/isCommandExists
 * @createdAt   2017-04-11
 *
 * @copyright   Copyright (c) 2017 Zhonglei Qiu
 * @license     Licensed under the MIT license.
 *
 */
var isWin = require('../sys/isWin')
var execSync = require('child_process').execSync

module.exports = function(command) {
  return isWin ? /* istanbul ignore next */ winCommandExistsSync(command) : unixCommandExistsSync(command)
}

function unixCommandExistsSync(command) {
  try {
    var stdout = execSync('command -v ' + command
      + ' 2>/dev/null'
      + ' && { echo >&1 \'' + command + ' found\'; exit 0; }'
    )
    return !!stdout
  } catch (e) {
    return false
  }
}

/* istanbul ignore next */
function winCommandExistsSync(command) {
  try {
    var stdout = execSync('where ' + command)
    return !!stdout
  } catch (e) {
    return false
  }
}
