var fs = require('fs')
var path = require('path')

function walk(rootDir, callback) {
  fs.readdirSync(rootDir).forEach(function(fileName) {
    var fileFullPath = path.join(rootDir, fileName)
    var fileStat = fs.statSync(fileFullPath)

    if (callback(rootDir, fileName, fileFullPath, fileStat) !== false) {
      if (fileStat.isDirectory()) {
        walk(fileFullPath, callback)
      }
    }
  })
}

module.exports = walk
