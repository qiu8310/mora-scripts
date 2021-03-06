var cp = require('child_process')
var assert = require('assert')
var sinon = require('sinon')
var shell = require('rewire')('../shell')

/* eslint-env mocha */

describe('libs/tty/shell', function() {
  var spy
  beforeEach(function() {
    spy = sinon.stub(cp, 'spawn').callsFake(function() {})
  })
  afterEach(function() {
    spy.restore()
  })

  it('should work on windows', function() {
    shell.__with__({ isWin: true })(function() {
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
  it('should work on none windows', function() {
    shell.__with__({ isWin: false })(function() {
      shell('ls')
      assert.ok(spy.calledOnce)
      assert.ok(spy.firstCall.calledWith('/bin/sh', ['-c', 'ls'], {}))
    })
  })
})

describe('libs/tty/shell.promise', function() {
  var spy
  afterEach(function() {
    spy.restore()
  })

  it('should work on promise success', function(done) {
    spy = sinon.stub(cp, 'spawn').callsFake(function() {
      return {
        on: function(type, callback) { callback(0) }
      }
    })
    shell.__with__({ isWin: false })(function() {
      shell.promise('ls')
        .then(function(code) {
          assert.equal(code, 0)
          done()
        })
        .catch(function(code) {
          done(code)
        })
    })
  })

  it('should work on promise error', function(done) {
    spy = sinon.stub(cp, 'spawn').callsFake(function() {
      return {
        on: function(type, callback) { callback(1) }
      }
    })
    shell.__with__({ isWin: false, code: 1 })(function() {
      shell.promise('ls')
        .then(function(code) {
          done(new Error('not expected'))
        })
        .catch(function(code) {
          assert.equal(code, 1)
          done()
        })
    })
  })
})
