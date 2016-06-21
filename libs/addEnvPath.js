// 参考 npm package: manage-path

var isWin = process.platform === 'win32';
var separator = isWin ? ';' : ':';

module.exports = function (env, paths) {
  var pathKey = getPathKey(env);
  paths = (env[pathKey] || '').split(separator).concat(paths);
  env[pathKey] = paths.join(separator);
}

function getPathKey(env) {
  var re = /^path$/i;
  if (isWin) {
    var keys = Object.keys(env);
    for (var i = 0; i < keys.length; i++) {
      if (re.test(keys[i])) return keys[i];
    }
  }
  return 'PATH';
}
