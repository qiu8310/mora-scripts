var assert = require('assert')
var path = require('path')
var fs = require('fs')
var exists = require('../exists')


describe('libs/fs/exists', function () {

  context('without type argument', function () {
    var file;

    it('should return true if file exists', function () {
      file = __filename
      assert.equal(exists(file), true, 'expect file ' + file + ' exists')

      file = path.resolve(__dirname, '../exists.js')
      assert.equal(exists(file), true, 'expect file ' + file + ' exists')
    })

    it('#should return false if file not exists', function () {
      file = path.join(__dirname, Math.random().toString())
      assert.equal(exists(file), false, 'expect file ' + file + ' not exists')

      file = __filename + 'xx'
      assert.equal(exists(file), false, 'expect file ' + file + ' not exists')
    })
  })

  context('with one type argument', function () {

    var file, dir;

    it('should return exactly the same if `type` is "file" or null', function () {
      assert.equal(exists(__filename, 'file'), exists(__filename, null))
    })

    it('should return exactly the same if `type` is string "file" or array "file"', function () {
      assert.equal(exists(__filename, 'file'), exists(__filename, ['file']))
    })

    it('should return directory exists', function () {
      assert.equal(exists(__dirname, 'directory'), true)
      assert.equal(exists(__dirname + 'xx', 'directory'), false)
    })
  })

  context('with multiple types argument', function () {
    it('should return true if matched any specified type', function () {
      assert.equal(exists(__filename, ['directory', 'socket', 'file']), true)
    })

    it('should return false if not matched any specified type', function () {
      assert.equal(exists(__filename, ['directory', 'socket']), false)
    })
  })
})
