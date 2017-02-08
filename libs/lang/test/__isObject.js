var assert = require('assert')
var isObject = require('../isObject')

/* eslint-env mocha */

describe('libs/lang/isObject', function() {
  it('should returns true', function() {
    assert.equal(isObject({}), true, 'empty object is object')
    assert.equal(isObject([]), true, 'array is object')
    assert.equal(isObject(/a/), true, 'regexp is object')
    assert.equal(isObject(new Date()), true, 'date is object')
    assert.equal(isObject(Object.create(null)), true, 'created is object')
    assert.equal(isObject(function() {}), true, 'function is object')
  })

  it('should returns false', function() {
    assert.equal(isObject(null), false, 'null is not object')
    assert.equal(isObject(1), false, 'number is not object')
    assert.equal(isObject('a'), false, 'string is not object')
    assert.equal(isObject(true), false, 'boolean is not object')
    assert.equal(isObject(undefined), false, 'undefined is not object')
    assert.equal(isObject(NaN), false, 'NaN is not object')
  })
})
