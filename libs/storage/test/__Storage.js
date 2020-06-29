var assert = require('assert')
var Storage = require('../Storage')
var sinon = require('sinon')

require('../../lang/promiseExtra')

/* eslint-env mocha */

describe('libs/storage/Storage', function() {
  context('init', function() {
    it('before init', function() {
      var s = new Storage()
      assert.equal(s.data, null)
      assert.deepEqual(s.opts, {})

      var opts = {a: 'foo'}
      s = new Storage(opts)
      assert.equal(s.data, null)
      assert.equal(s.opts, opts)
    })
    it('async', function(done) {
      var s = new Storage()
      var p = s.init()
      assert.ok(p instanceof Promise)
      p.then(function() {
        assert.deepEqual(s.data, {})
        done()
      })
    })
    it('sync', function() {
      var s = new Storage()
      s.initSync()
      assert.deepEqual(s.data, {})
    })
    it('autoInit', function() {
      var s = new Storage({autoInit: true})
      assert.deepEqual(s.data, {})
    })
  })

  context('get', function() {
    it('async', function(done) {
      var s = new Storage()

      s.initSync({foo: true})
      var p = s.get('foo')
      assert.ok(p instanceof Promise)
      p.then(function(d) {
        assert.equal(d, true)
        return s.get('bar')
          .then(function(u) {
            assert.equal(u, undefined)
          })
      })
      .then(done, done)
    })

    it('sync', function() {
      var s = new Storage()
      s.initSync({foo: true})
      assert.equal(s.getSync('foo'), true)
      assert.equal(s.getSync('bar'), undefined)
    })
  })

  context('has', function() {
    it('async', function(done) {
      var s = new Storage({autoInit: true})
      var p = s.has('foo')
      assert.ok(p instanceof Promise)
      p.then(function(d) {
        assert.equal(d, false)
      }).then(done, done)
    })
    it('sync', function() {
      var s = new Storage()
      s.initSync({foo: true})
      assert.ok(s.hasSync('foo'))
      assert.ok(!s.hasSync('bar'))
    })
  })

  context('set', function() {
    it('async', function(done) {
      var s = new Storage()
      s.initSync({foo: true})

      Promise
        .try(function() {
          return s.set('bar', true)
        })
        .then(function() {
          assert.equal(s.getSync('bar'), true)
          assert.equal(s.getSync('foo'), true)
          return s.set('foo', false)
        })
        .then(function() {
          assert.equal(s.getSync('bar'), true)
          assert.equal(s.getSync('foo'), false)
          return Promise.resolve()
        })
        .then(done, done)
    })
    it('sync', function() {
      var s = new Storage()
      s.initSync({foo: true})

      s.setSync('bar', true)
      assert.equal(s.getSync('bar'), true)
      assert.equal(s.getSync('foo'), true)

      s.setSync('foo', false)
      assert.equal(s.getSync('bar'), true)
      assert.equal(s.getSync('foo'), false)
    })
  })

  context('del', function() {
    it('async', function(done) {
      var s = new Storage()
      s.initSync({foo: true})

      Promise
        .try(function() {
          s.del('foo')
        })
        .then(function() {
          assert.equal(s.getSync('foo'), undefined)
        })
        .then(done, done)
    })
    it('sync', function() {
      var s = new Storage()
      s.initSync({foo: true})
      s.delSync('foo')
      assert.equal(s.getSync('foo'), undefined)
      s.delSync('bar')
    })
  })

  context('define', function() {
    it('specify key', function() {
      var s = new Storage()
      s.initSync({foo: true})

      s.define('foo')
      assert.equal(s.foo, true)
      s.foo = 1
      assert.equal(s.foo, 1)
      assert.equal(s.getSync('foo'), 1)
    })
    it('specify keys', function() {
      var s = new Storage()
      s.initSync({a: 1, b: 2})
      s.define(['a', 'b'])
      assert.equal(s.a, 1)
      assert.equal(s.b, 2)
      s.a = 2
      assert.equal(s.a, 2)
      assert.equal(s.b, 2)
    })
    it('specify no key', function() {
      var s = new Storage()
      s.initSync({a: 1, b: 2})
      s.define()
      assert.equal(s.a, 1)
      assert.equal(s.b, 2)
      s.a = 2
      assert.equal(s.a, 2)
      assert.equal(s.b, 2)
    })
    it('specify key not exists', function() {
      var s = new Storage()
      s.initSync()
      s.define('a')
      assert.equal(s.a, undefined)
      s.a = 2
      assert.equal(s.a, 2)
      assert.equal(s.getSync('a'), 2)
    })
    it('warn message', function() {
      var spy = sinon.stub(console, 'warn')
      var s = new Storage({autoInit: true})
      s.xx = true
      s.define(['toJSON', 'xx'])
      assert.equal(spy.callCount, 2)
      spy.restore()
    })
    it('silent warn message', function() {
      var spy = sinon.stub(console, 'warn')
      var s = new Storage({autoInit: true})
      s.xx = true
      s.define(['toJSON', 'xx'], true)
      assert.equal(spy.callCount, 0)
      spy.restore()
    })
  })

  it('toString', function() {
    var s = new Storage()
    assert.equal(s.toString(), 'null')

    s.initSync({foo: true})
    assert.equal(s.toString(), '{"foo":true}')
  })

  it('toJSON', function() {
    var s = new Storage()
    var d = {foo: true}
    s.initSync(d)

    assert.ok(s.toJSON() !== d)
    assert.deepEqual(s.toJSON(), d)
  })
})
