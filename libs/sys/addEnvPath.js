/**
 * @module      libs/sys/addEnvPath
 * @createdAt   2016-07-14
 *
 * @copyright   Copyright (c) 2016 Zhonglei Qiu
 * @license     Licensed under the MIT license.
 */

var isWin = require('./isWin')
var rePath = /^path$/i

/**
 * 添加指定的路径到 PATH 环境变量中
 *
 * 新添加的路径都会放在最前面，方便系统最先解析它
 *
 * @param  {Object}               env     process.env 对象
 * @param  {Array<String>|String} paths   要添加的路径
 * @return {Object}               传入的 env 对象
 *
 * @example
 * var env = addEnvPath(process.env, ['/you/path/need/to/add'])
 * console.log(env === process.env) // true: 意味着返回的是修改过的原对象，而不是一个新对象
 *
 * @see [manage-path@2.0.0]{@link https://github.com/kentcdodds/node-manage-path/tree/v2.0.0}
 * @author Zhonglei Qiu
 * @since 2.0.0
 */
module.exports = function(env, paths) {
  var pathKey = getPathKey(env)
  var oldPath = env[pathKey]
  if (!Array.isArray(paths)) paths = [paths]
  if (oldPath) paths = paths.concat(oldPath) // 不要修改用户传过来的数组
  env[pathKey] = paths.join(isWin ? ';' : ':') // 放函数里面来得到 separator 是为了方便测试
  return env
}

function getPathKey(env) {
  if (isWin) {
    var keys = Object.keys(env)
    for (var i = 0; i < keys.length; i++) {
      if (rePath.test(keys[i])) return keys[i]
    }
  }
  return 'PATH'
}
