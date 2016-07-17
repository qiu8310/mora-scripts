var assert = require('assert')
var format = require('../../sys/info').format
var stripAnsi = require('../stripAnsi')

/* eslint-env mocha */

describe('libs/tty/stripAnsi', function () {
  it('should be a function', function () {
    assert.equal(typeof stripAnsi, 'function')
  })

  it('should exports the regexp', function () {
    assert.ok(stripAnsi.gre instanceof RegExp)
  })

  it('should strip ansi code', function () {
    var ansiStr1 = format('b')
    var ansiStr2 = 'a' + ansiStr1
    var ansiStr3 = ansiStr1 + 'c'
    var ansiStr4 = ansiStr2 + 'c'

    assert.notEqual(ansiStr1, 'b')
    assert.notEqual(ansiStr2, 'ab')
    assert.notEqual(ansiStr3, 'bc')
    assert.notEqual(ansiStr4, 'abc')

    assert.equal(stripAnsi(ansiStr1), 'b')
    assert.equal(stripAnsi(ansiStr2), 'ab')
    assert.equal(stripAnsi(ansiStr3), 'bc')
    assert.equal(stripAnsi(ansiStr4), 'abc')
  })

  it('should return itself when str is not a string', function () {
    assert.equal(stripAnsi(true), true)
    assert.equal(stripAnsi(1), 1)
  })
})
