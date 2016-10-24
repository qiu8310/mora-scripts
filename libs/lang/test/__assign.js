var assert = require('assert')
var assign = require('../assign')

/* global Symbol:false */
/* eslint-env mocha */

describe('libs/lang/assign', function() {
  it('should throws when target is null', function() {
    assert.throws(function() {
      assign(null)
    }, TypeError)

    assert.throws(function() {
      assign(null, {foo: 0})
    }, TypeError)

    assert.throws(function() {
      assign(undefined)
    }, TypeError)
  })

  it('should assign own enumerable properties from source to target object', function() {
    assert.deepEqual(assign({foo: 0}, {bar: 1}), {foo: 0, bar: 1})
    assert.deepEqual(assign({foo: 0}, null, undefined, true), {foo: 0})
    assert.deepEqual(assign({foo: 0}, null, {bar: 1}), {foo: 0, bar: 1})
  })

  it('should only iterate own keys', function() {
    var F = function() {}
    F.prototype.foo = 0

    var f = new F()
    f.bar = 1

    assert.deepEqual(assign({}, f), {bar: 1})
  })

  it('should returns modified target object', function() {
    var target = {}
    assert.equal(assign(target, {foo: 0}), target)
  })

  if (typeof Symbol !== 'undefined') {
    it('should support symbol properties', function() {
      var target = {}
      var source = {}
      var sym = Symbol('foo')
      source[sym] = 'bar'
      assign(target, source)
      assert.equal(target[sym], 'bar')
    })
    it('should only copy enumerable symbols', function() {
      var target = {}
      var source = {}
      var sym = Symbol('foo')
      Object.defineProperty(source, sym, {
        enumerable: false,
        value: 'bar'
      })
      assign(target, source)
      assert.equal(target[sym], undefined)
    })
  }
})
