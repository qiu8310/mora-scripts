var assert = require('assert')
var FileStorage = require('../FileStorage')
var exists = require('../../fs/exists')
var fs = require('fs')
var resolve = require('path').resolve
var FIXTURES = resolve(__dirname, 'fixtures')

var FILE = resolve(FIXTURES, 'fs.json')
var DIR = resolve(FIXTURES, 'fsDir')
var FILE_CONTENT = '{"foo":1,"bar":null}'
fs.writeFileSync(FILE, FILE_CONTENT)

require('../../lang/promiseExtra')

/* eslint-env mocha */

describe('libs/storage/FileStorage', function () {

  it('init from exists file', function (done) {
    var s = new FileStorage({file: FILE})
    s.initSync()
    s.define()
    assert.equal(s.foo, 1)
    assert.equal(s.bar, null)

    s.initSync() // 重复 init 没有影响
    assert.equal(s.foo, 1)
    assert.equal(s.bar, null)

    s = new FileStorage({file: FILE})
    s.init()
      .then(function () {
        s.define()
        assert.equal(s.foo, 1)
        assert.equal(s.bar, null)
        return s.init() // 重复 init 没有影响
      })
      .then(function () {
        assert.equal(s.foo, 1)
        assert.equal(s.bar, null)
      })
      .then(done, done)
  })

  it('init from not exists file', function (done) {
    var f = resolve(FIXTURES, 'xx')

    new FileStorage({file: f}).initSync()
    assert.ok(exists(f))
    fs.unlinkSync(f)

    new FileStorage({file: f}).init()
      .then(function () {
        assert.ok(exists(f))
        fs.unlinkSync(f)
        done()
      })
  })

  it('init from exists directory', function (done) {
    var s = new FileStorage({file: DIR})
    assert.throws(function () {
      s.initSync()
    })

    s.init()
      .catch(function (e) {
        assert.ok(e)
        done()
      })
  })

  it('update sync error', function () {
    var f = resolve(FIXTURES, 'us')
    var s = new FileStorage({file: f})
    s.initSync()
    changeFileToDirectory(f)
    assert.throws(function () {
      s.setSync('a', 1)
    })
    rmdir(f)
  })

  it('update async error', function (done) {
    var f = resolve(FIXTURES, 'ua')
    var s = new FileStorage({file: f})
    s.initSync()
    changeFileToDirectory(f)
    s.set('a', 1)
      .catch(function (e) {
        rmdir(f)
        done()
      })
  })
})

function changeFileToDirectory (file) {
  fs.unlinkSync(file)
  fs.mkdirSync(file)
}

function rmdir (file) {
  fs.rmdirSync(file)
}
