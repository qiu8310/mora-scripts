var assert = require('assert')
var fs = require('fs')
var resolve = require('path').resolve

var walk = require('../walk')

/* eslint-env mocha */

var fixturesDir = resolve(__dirname, './fixtures')

describe('libs/fs/walk', function() {
  it('should walk directory', function() {
    var testDirName = 'config'
    var hasCallback = false
    var count = 0
    walk(fixturesDir, function(fileDir, fileName, fileFullPath, fileStats) {
      hasCallback = true
      if (fileDir === fixturesDir && fileName !== testDirName) return false
      if (fileName !== testDirName) {
        count++
      }
    })

    assert.ok(hasCallback)
    assert.equal(count, fs.readdirSync(resolve(fixturesDir, testDirName)).length)
  })
})
