var cp = require('child_process')
var assert = require('assert')
var sinon = require('sinon')
var shell = require('rewire')('../shell')

/* eslint-env mocha */

describe('libs/tty/shell', function () {
  var spy
  beforeEach(function () {
    spy = sinon.stub(cp, 'spawn', function () {})
  })
  afterEach(function () {
    spy.restore()
  })

  it('should work on windows', function () {
    shell.__with__({ isWin: true })(function () {
      var options = {}
      shell('ls', options)
      assert.equal(options.windowsVerbatimArguments, undefined)
      assert.ok(spy.calledOnce)
      assert.ok(spy.firstCall.calledWith(
        'cmd.exe',
        ['/s', '/c', '"ls"'],
        { windowsVerbatimArguments: true }
      ))
    })
  })
  it('should work on none windows', function () {
    shell.__with__({ isWin: false })(function () {
      shell('ls')
      assert.ok(spy.calledOnce)
      assert.ok(spy.firstCall.calledWith('/bin/sh', ['-c', 'ls'], {}))
    })
  })
})
