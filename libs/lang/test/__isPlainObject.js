var assert = require('assert')
var isPlainObject = require('../isPlainObject')

/* eslint-env mocha */

describe('libs/lang/isPlainObject', function() {
  it('should returns true on plain object', function() {
    assert.equal(isPlainObject({}), true, 'empty object is plain object')
    assert.equal(isPlainObject({a: 11}), true, 'no empty object is also plain object')
  })

  it('should returns false on not plain object', function() {
    assert.equal(isPlainObject(null), false, 'null is not plain object')
    assert.equal(isPlainObject(1), false, 'number is not plain object')
    assert.equal(isPlainObject([]), false, 'array is not plain object')
    assert.equal(isPlainObject(/a/), false, 'regexp is not plain object')
    assert.equal(isPlainObject(function() {}), false, 'function is not plain object')
  })
})
