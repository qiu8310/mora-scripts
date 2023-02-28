var os = require('os')
var isWin = require('./isWin')
var env = process.env

/**
 * @param {NodeJS.WriteStream} stream
 */
function supportColor(stream) {
  var force = envForceColor()
  if (force != null) return force

  stream = stream || process.stdout
  if (!stream || !stream.isTTY) return false

  if (env.CI) return !!env.GITHUB_ACTIONS

  if (isWin) {
		// Windows 10 build 14931 is the first release that supports 16m/TrueColor.
    var osRelease = os.release().split('.')
    return Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 14931
  }

  // 其它统一都支持
  return true
}

module.exports = supportColor

function envForceColor() {
  var val = env.FORCE_COLOR || ''
  if (/^(true|1)$/i.test(val)) return true
  if (/^(false|0)$/i.test(val)) return false
}
