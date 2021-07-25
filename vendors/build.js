var path = require('path')
var fs = require('fs')
var ncc = require('@vercel/ncc')

var dir = path.resolve(__dirname)

function build(moduleName) {
  var tmpFile = path.join(dir, '__' + moduleName + '.js')
  var distFile = path.join(dir, moduleName + '.js')
  fs.writeFileSync(tmpFile, 'module.exports = require("' + moduleName + '")')
  ncc(tmpFile).then(res => {
    fs.writeFileSync(distFile, res.code)
    fs.unlinkSync(tmpFile)
  })
}

build('cross-spawn')
build('semver-regex')
