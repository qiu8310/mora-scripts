var assert = require('assert')
var hasOwnEnumProp = require('../hasOwnEnumProp')

/* eslint-env mocha */

describe('libs/lang/hasOwnEnumProp', function () {
  function Person() {
    this.bar = 'inst'
  }

  Person.prototype.foo = 'proto'

  var p = new Person()
  var o = {bar: 'inst'}
  var d = {}

  Object.defineProperties(d, {
    foo: {
      enumerable: false,
      value: 1
    },
    bar: {
      enumerable: true,
      value: 2
    }
  })

  context('class instance prototype', function () {
    it('should returns true on instance prototype', function () {
      assert.equal(hasOwnEnumProp(p, 'bar'), true)
    })

    it('should returns true on keys exists in object', function () {
      assert.equal(hasOwnEnumProp(o, 'bar'), true)
    })
  })

  context('plain object prototype', function () {
    it('should returns true on enumerable key', function () {
      assert.equal(hasOwnEnumProp(d, 'bar'), true)
    })

    it('should returns false on prototype property', function () {
      assert.equal(hasOwnEnumProp(p, 'foo'), false)
    })
  })

  context('plain object with defineProperties prototype', function () {
    it('should returns false on not exists key of object', function () {
      assert.equal(hasOwnEnumProp(o, 'foo'), false)
    })

    it('should returns false on no enumerable key', function () {
      assert.equal(hasOwnEnumProp(d, 'foo'), false)
    })
  })

  context('native prototype property', function () {
    it('should returns false on hasOwnProperty', function () {
      assert.equal(hasOwnEnumProp({}, 'hasOwnProperty'), false)
      assert.equal(hasOwnEnumProp({}, 'toString'), false)
    })

    it('should return true if hasOwnProperty is object instance key', function () {
      assert.equal(hasOwnEnumProp({hasOwnProperty: null}, 'hasOwnProperty'), true)
      assert.equal(hasOwnEnumProp({toString: null}, 'toString'), true)
    })
  })

  context('no object prototype', function () {
    it('should returns false', function () {
      assert.equal(hasOwnEnumProp(1,      'aa'), false, 'number')
      assert.equal(hasOwnEnumProp('str',  'aa'), false, 'string')
      assert.equal(hasOwnEnumProp(true,   'aa'), false, 'boolean')
      assert.equal(hasOwnEnumProp(null,   'aa'), false, 'null')
    })
  })

})
