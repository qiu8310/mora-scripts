var assert = require('assert')
var fs = require('fs')
var resolve = require('path').resolve

var isWin = require('../../sys/isWin')
var rm = require('../rm')
var exists = require('../exists')
var mkdirp = require('../mkdirp')

/* eslint-env mocha */

var fixturesDir = resolve(__dirname, './fixtures')
/* istanbul ignore next/if/else */

describe('libs/fs/mkdirp', function() {
  it('should create directory', function() {
    var dir = resolve(fixturesDir, 'm1')
    assert.ok(!exists(dir, 'Directory'))
    mkdirp(dir)
    assert.ok(exists(dir, 'Directory'))
    rm(dir)
  })

  it('should create directory recursive', function() {
    var dir = resolve(fixturesDir, 'm2', 'm22', 'm222')
    assert.ok(!exists(dir, 'Directory'))
    mkdirp(dir)
    assert.ok(exists(dir, 'Directory'))
    rm(resolve(fixturesDir, 'm2'))
  })

  if (!isWin) {
    it('should create directory with specified mode', function() {
      var dir = resolve(fixturesDir, 'm3')
      var mode = parseInt('0766', 8) & (~process.umask())
      mkdirp(dir, mode)
      assert.ok(exists(dir, 'Directory'), 'directory exists')
      assert.equal(fs.statSync(dir).mode & parseInt('0777', 8), mode, 'mode should match')
      rm(dir)
    })

    it('should create directory with specified mode object', function() {
      var dir = resolve(fixturesDir, 'm3')
      var mode = parseInt('0766', 8) & (~process.umask())
      mkdirp(dir, { mode: mode })
      assert.ok(exists(dir, 'Directory'), 'directory exists')
      assert.equal(fs.statSync(dir).mode & parseInt('0777', 8), mode, 'mode should match')
      rm(dir)
    })
  }

  it('should throws when exists a same file', function() {
    var file = resolve(fixturesDir, 'm3')
    assert.ok(!exists(file, ['File', 'Directory']))
    fs.writeFileSync(file, 'xxx')
    assert.throws(function() {
      mkdirp(file)
    })
    rm(file)
  })
})
