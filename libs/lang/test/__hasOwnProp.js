var assert = require('assert')
var hasOwnProp = require('../hasOwnProp')

/* eslint-env mocha */

describe('libs/lang/hasOwnProp', function () {
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

  context('class inst prototype', function () {
    it('should returns true on instance prototype', function () {
      assert.equal(hasOwnProp(p, 'bar'), true)
    })

    it('should returns false on prototype property', function () {
      assert.equal(hasOwnProp(p, 'foo'), false)
    })
  })

  context('plain object prototype', function () {
    it('should returns true on keys exists in object', function () {
      assert.equal(hasOwnProp(o, 'bar'), true)
    })

    it('should returns false on not exists key of object', function () {
      assert.equal(hasOwnProp(o, 'foo'), false)
    })
  })

  context('plain object with defineProperties prototype', function () {
    it('should returns true on enumerable key', function () {
      assert.equal(hasOwnProp(d, 'bar'), true)
    })

    it('should returns true on no enumerable key', function () {
      assert.equal(hasOwnProp(d, 'foo'), true)
    })
  })

  context('no object prototype', function () {
    it('should returns false', function () {
      assert.equal(hasOwnProp(1,      'aa'), false, 'number')
      assert.equal(hasOwnProp('str',  'aa'), false, 'string')
      assert.equal(hasOwnProp(true,   'aa'), false, 'boolean')
      assert.equal(hasOwnProp(null,   'aa'), false, 'null')
    })
  })
})
