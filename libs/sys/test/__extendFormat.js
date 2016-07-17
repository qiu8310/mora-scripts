var assert = require('assert')
var sinon = require('sinon')
var util = require('util')
var extendFormat = require('../extendFormat')

/* eslint-env mocha */

var defaultHandle = function (v) { return v }

describe('libs/sys/extendFormat', function () {
  it('should not handle when no format string', function () {
    var format = extendFormat(/%a/, defaultHandle)
    assert.equal(format(), util.format())
    assert.equal(format('aa'), 'aa')
    assert.equal(format('aa', 'bb'), 'aa bb')
  })

  it('should not handle when template is not string', function () {
    var format = extendFormat(/%a/, defaultHandle)
    assert.equal(format(true), util.format(true))
  })

  it('should escape % with %%', function () {
    var format = extendFormat(/%a/, defaultHandle)
    assert.equal(format('%% %a', 'foo', 'bar'), '% foo bar')
  })

  it('should throws when match include captcher group', function () {
    assert.throws(function () {
      extendFormat(/(%a)/, defaultHandle)
    })
  })

  it('should return number format function', function () {
    var spy = sinon.spy(function (value, format) {
      return parseInt(value, 10).toString()
    })

    var format = extendFormat(/%f/, spy)

    assert.equal(format('a %f', '10.10'), 'a 10', 'single format')
    assert.equal(format('%s %f', 'a', '10'), 'a 10', 'double format')
    assert.equal(format('%s', 'a', '%f', '10'), 'a 10', 'format group')

    assert.equal(spy.callCount, 3)
    assert.ok(spy.firstCall.calledWith('10.10', '%f'))
    assert.ok(spy.secondCall.calledWith('10', '%f'))
    assert.ok(spy.thirdCall.calledWith('10', '%f'))
  })

  it('should support order property', function () {

    var format1 = extendFormat([
      {match: /%a/, order: 1, handle: defaultHandle},
      {match: /%aa/, order: 2, handle: defaultHandle}
    ])
    var format2 = extendFormat([
      {match: /%a/, order: 2, handle: defaultHandle},
      {match: /%aa/, order: 1, handle: defaultHandle}
    ])

    assert.equal(format1('%aa', 'b'), 'ba')
    assert.equal(format2('%aa', 'b'), 'b')
  })

  context('expectArgNum', function () {

    it('can equal 0', function () {
      var handle = sinon.spy(function () {
        return 'hack'
      })
      var format = extendFormat({
        match: /%a/,
        handle: handle,
        expectArgNum: 0
      })

      assert.equal(format('%a b', 'c'), 'hack b c')
      assert.equal(format('%a%a', 'c'), 'hackhack c')
      assert.equal(format('%a b %%', 'c'), 'hack b % c')
      assert.equal(format('%a b %d', 3, 'c'), 'hack b 3 c')

      assert.ok(handle.firstCall.calledWith('%a'))
      assert.ok(handle.secondCall.calledWith('%a'))
      assert.ok(handle.thirdCall.calledWith('%a'))
    })

    it('can equal 2', function () {
      var handle = sinon.spy(function (a, b, format) {
        return a + b
      })
      var format = extendFormat({
        match: /%a/,
        handle: handle,
        expectArgNum: 2
      })

      assert.equal(format('%a d', 'b', 'c'), 'bc d')
      assert.equal(format('%a, %a', 'b', 'c', 1, 2), 'bc, 3')
    })

    it('should not handled when expect 1 bug got 0', function () {
      var handle = sinon.spy()
      var format = extendFormat(/%a/, handle)

      assert.equal(format('%a a'), '%a a')
      assert.equal(handle.callCount, 0)
    })

    it('should not handled when expect 2 bug got 0 or 1', function () {
      var handle = sinon.spy()
      var format = extendFormat({match: /%a/, handle: handle, expectArgNum: 2})

      assert.equal(format('%a a'), '%a a')
      assert.equal(format('%a a', 'a'), '%a a a')
      assert.equal(format('%d %a a', '1','a'), '1 %a a a')
      assert.equal(format('%a a', 'a'), '%a a a')
      assert.equal(handle.callCount, 0)
    })
  })

  context('hooks', function () {
    it('support onStart and onEnd', function () {
      var onStart = sinon.spy(function () {
        return 's_'
      })
      var onEnd = sinon.spy(function () {
        return '_e'
      })
      var format = extendFormat({
        match: /%a/,
        handle: defaultHandle,
        onStart: onStart,
        onEnd: onEnd
      })

      assert.equal(format('a', 'b'), 's_a b_e')
      assert.equal(format('%a', 'b'), 's_b_e')
      assert.equal(format('%a %a', 'b', 'c'), 's_b c_e')
      assert.equal(format('%a', 'b', '%a', 'c'), 's_b c_e')
    })
    it('support onGroupStart and onGroupEnd', function () {
      var onGroupStart = sinon.spy(function () {
        return 's_'
      })
      var onGroupEnd = sinon.spy(function () {
        return '_e'
      })
      var format = extendFormat({
        match: /%a/,
        handle: defaultHandle,
        onGroupStart: onGroupStart,
        onGroupEnd: onGroupEnd
      })

      assert.equal(format('a', 'b'), 's_a_e s_b_e')
      assert.equal(format('%a', 'b'), 's_b_e')
      assert.equal(format('%a %a', 'b', 'c'), 's_b c_e')
      assert.equal(format('%a', 'b', '%a', 'c'), 's_b_e s_c_e')
    })
    it('support onFormatStart and onFormatEnd', function () {
      var onFormatStart = sinon.spy(function () {
        return 's_'
      })
      var onFormatEnd = sinon.spy(function () {
        return '_e'
      })
      var format = extendFormat({
        match: /%a/,
        handle: defaultHandle,
        onFormatStart: onFormatStart,
        onFormatEnd: onFormatEnd
      })

      assert.equal(format('a', 'b'), 'a b')
      assert.equal(format('%a', 'b'), 's_b_e')
      assert.equal(format('%a %a', 'b', 'c'), 's_b_e s_c_e')
      assert.equal(format('%a', 'b', '%a', 'c'), 's_b_e s_c_e')
    })
  })
})
