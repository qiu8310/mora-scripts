var assert = require('assert')
var util = require('util')
var sinon = require('sinon')

var error = require('../error')
var warn = require('../warn')
var info = require('../info')

/* eslint-env mocha */

describe('libs/sys/error,warn,info', function() {
  it('should have format function', function() {
    assert.equal(typeof error.format, 'function')
    assert.equal(typeof warn.format, 'function')
    assert.equal(typeof info.format, 'function')
  })

  it('should call util.format in error,warn,info', function() {
    var log = sinon.stub(console, 'log', function() {})
    var spy = sinon.spy(util, 'format')

    error('a', 'b')
    info('%s', 'c')
    warn('d')

    assert.ok(spy.firstCall.calledWith('a', 'b'))
    assert.ok(spy.secondCall.calledWith('%s', 'c'))
    assert.ok(spy.thirdCall.calledWith('d'))
    spy.alwaysCalledOn(util)
    assert.equal(spy.callCount, 3)

    spy.restore()
    log.restore()
  })
})

