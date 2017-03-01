/* eslint-env mocha */

var assert = require('assert')
var sinon = require('sinon')
var Events = require('../Events')

var noop = function() {}

describe('libs/lang/Events', function() {
  it('should have on/once/emit/off functions', function() {
    var e = new Events()
    assert.ok(!!e.on)
    assert.ok(!!e.once)
    assert.ok(!!e.emit)
    assert.ok(!!e.off)
    assert.ok(!!e._events)
  })

  it('should not triggle anything when no listener', function() {
    var e = new Events()
    e.emit('click')
    e.emit('click.foo')
  })

  it('should triggle listener with same type and namespace', function(done) {
    var e = new Events()
    var count = 0
    var addCount = function(num) { return function() { count += num } }
    e.on('click', addCount(1))
    e.on('click.double', addCount(2))

    e.emit('click')   // +1 +2
    e.emit('click.double') // +2
    e.emit('click.foo') // will not triggle anything

    setTimeout(function() {
      assert.equal(count, 5)
      assert.deepEqual(Object.keys(e._events), ['click'])
      done()
    }, 10)
  })

  it('should triggle only one time when use once', function(done) {
    var e = new Events()
    var count = 0
    var handler = function() {
      count++
    }
    e.once('click', handler)
    e.emit('click')
    e.emit('click')
    e.emit('click')
    setTimeout(function() {
      assert.equal(e._events.click.length, 0)
      assert.equal(count, 1)
      done()
    }, 10)
  })

  it('should pollute handler this context', function(done) {
    var e = new Events()
    e.on('click.foo', 'some data', function(arg) {
      assert.equal(arg, 1)
      assert.equal(this.type, 'click')
      assert.equal(this.namespace, 'foo')
      assert.equal(this.once, false)
      assert.equal(this.data, 'some data')
      done()
    })
    e.emit('click', 1)
  })

  it('should be able remove events', function() {
    var e = new Events()
    e.on('foo', noop)
    e.on('bar', noop)
    e.on('tar', noop)
    e.on('goo', noop)
    assert.equal(Object.keys(e._events).length, 4)

    e.off('xxx')
    e.off('foo', function() {}) // 无法删除
    assert.equal(e._events.foo.length, 1)

    e.off('foo', noop)  // 删除了一个
    assert.equal(e._events.foo.length, 0)

    e.off('bar')  // 又删除了一个
    assert.equal(e._events.bar.length, 0)

    e.off() // 全删除
    assert.equal(Object.keys(e._events).length, 0)
  })

  it('should be able remove events whit namespace', function() {
    var e = new Events()
    e.on('click.foo', noop)
    e.on('click.bar', noop)
    e.on('click', noop)

    assert.equal(e._events.click.length, 3)

    e.off('click.tar') // nothing removed
    assert.equal(e._events.click.length, 3)

    e.off('click.foo') // remove 1
    assert.equal(e._events.click.length, 2)

    e.off('click') // remove 2
    assert.equal(e._events.click.length, 0)
  })

  it('should be able to mixin to object', function(done) {
    var obj = {a: 'aa'}
    Events.mixin(obj)
    assert.ok(!!obj.on)
    assert.ok(!!obj.once)
    assert.ok(!!obj.off)
    assert.ok(!!obj.emit)

    obj.on('click', function() {
      done()
    })
    obj.emit('click')
  })
  it('should be able to mixin to function', function(done) {
    function Foo() {}
    Events.mixin(Foo)
    var f = new Foo()
    assert.ok(!!f.on)
    assert.ok(!!f.once)
    assert.ok(!!f.off)
    assert.ok(!!f.emit)

    f.on('click', function() {
      done()
    })
    f.emit('click')
  })

  it('should warn when Object already contains on/once/off/emit/_events', function() {
    var spy = sinon.stub(console, 'warn', function() {})
    var obj = {_events: 123, on: 456, off: 789}
    Events.mixin(obj)

    assert.equal(spy.callCount, 3)
    spy.restore()
  })
})

