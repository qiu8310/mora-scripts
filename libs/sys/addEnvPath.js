// 参考 npm package: manage-path

var isWin = process.platform === 'win32'
var separator = isWin ? ';' : ':'

module.exports = function (env, paths) {
  var pathKey = getPathKey(env)
  var oldPath = env[pathKey]

  if (!Array.isArray(paths)) paths = [paths]
  if (oldPath) paths = paths.concat(oldPath) // 不要修改用户传过来的数组
  env[pathKey] = paths.join(separator)
}

function getPathKey (env) {
  var re = /^path$/i
  if (isWin) {
    var keys = Object.keys(env)
    for (var i = 0; i < keys.length; i++) {
      if (re.test(keys[i])) return keys[i]
    }
  }
  return 'PATH'
}
