var assert = require('assert')
var fs = require('fs')
var resolve = require('path').resolve

var exists = require('../exists')
var mkdirp = require('../mkdirp')

var rm = require('rewire')('../rm')

/* eslint-env mocha */

var fixturesDir = resolve(__dirname, './fixtures')

describe('libs/fs/rm', function() {
  it('should remove single directory', function() {
    var dir = resolve(fixturesDir, 'xx1')
    mkdirp(dir)
    assert.ok(exists(dir, 'Directory'))
    rm(dir)
    assert.ok(!exists(dir, 'Directory'))
  })

  it('should remove single file', function() {
    var file = resolve(fixturesDir, 'xx2')
    fs.writeFileSync(file, 'foo')
    assert.ok(exists(file))
    rm(file)
    assert.ok(!exists(file))
  })

  it('should remove directory that include other files', function() {
    var dir = resolve(fixturesDir, 'xx3')
    mkdirp(dir)
    fs.writeFileSync(resolve(dir, 'foo'), 'foo')
    mkdirp(resolve(dir, 'bar'))
    assert.ok(exists(dir, 'Directory'))
    rm(dir)
    assert.ok(!exists(dir, 'Directory'))
  })

  it('should return false when remove not exists files', function() {
    var dir = resolve(fixturesDir, 'xx3')
    mkdirp(dir)
    var res = rm(resolve(dir, 'a', 'b'))
    assert.ok(res === false)
  })
})
