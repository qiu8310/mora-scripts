const path = require('path')
const ROOT = path.resolve(__dirname, '..', '..')
const PKG = 'mora-scripts'

/**
 * 增强版的 require
 *
 * 系统的 require 检查的文件位置是固定的那些地方，
 * 如果我们想要像 webpack 那样，可以随意指定
 * resolve root 的话，可以通过此函数来实现！
 *
 * 当然此函数不支持随意指定 resolve root，只支持
 * 处理以 mora-scripts 开头的依赖，使目标文件可
 * 以在不同的环境中使用
 *
 * @param  {String} filepath 依赖的文件
 * @return {*}               解析后的 module
 */
function req (filepath) {
  if (filepath.startsWith(PKG)) {
    filepath = ROOT + filepath.substr(PKG.length)
  }
  return require(filepath)
}

// 复制原生的 require 的属性到新的 req 上
Object.keys(require).forEach(key => {
  req[key] = typeof require[key] === 'function'
    ? require[key].bind(require)
    : require[key]
})

module.exports = req
