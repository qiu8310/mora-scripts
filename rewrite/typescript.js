var Module = require('module')
var originalRequire = Module.prototype.require

Module.prototype.require = function() {
  if (arguments[0] === 'typescript') {
    // 使用本地的 typescript
    var local = require.resolve(arguments[0], { paths: [process.cwd()] })
    return originalRequire.apply(this, local)
  }
  return originalRequire.apply(this, arguments)
}
