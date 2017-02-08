var assert = require('assert')
var sinon = require('sinon')

var _map = {}
global.window = {
  localStorage: {
    getItem: function(key) {
      return _map[key]
    },
    setItem: function(key, val) {
      _map[key] = val
    },
    removeItem: function(key) {
      delete _map[key]
    }
  }
}

var BS = require('rewire')('../BrowserStorage')

/* eslint-env mocha */

describe('libs/storage/BrowserStorage', function() {
  after(function() {
    delete global.window
  })

  context('enable', function() {
    it('init from empty', function(done) {
      var bs = new BS({key: '__bs1'})
      bs.init()
        .then(function() {
          assert.ok(bs.data)
          bs.setSync('a', 1)
          assert.ok(bs.getSync('a'), 1)
          window.localStorage.removeItem('__bs1')
        })
        .then(done, done)
    })

    it('init from init data', function() {
      var bs = new BS({key: '__bs2'})
      bs.initSync({foo: true})
      assert.ok(bs.getSync('foo'), true)
      bs.delSync('foo')
      assert.equal(bs.getSync('foo'), undefined)
      window.localStorage.removeItem('__bs2')
    })

    it('init from exists', function() {
      window.localStorage.setItem('__bs3', JSON.stringify({bar: 1}))
      var bs = new BS({key: '__bs3'})
      bs.initSync({bar: 2})
      bs.define()
      assert.equal(bs.bar, 1)
      bs.bar = 3
      assert.equal(bs.getSync('bar'), 3)
    })

    it('init from illegal data', function() {
      window.localStorage.setItem('__bs3', '{bar: ')
      var bs = new BS({key: '__bs3'})
      bs.initSync({bar: 2})
      bs.define()
      assert.equal(bs.bar, 2)
      bs.bar = 3
      assert.equal(bs.getSync('bar'), 3)
    })

    it('async update', function(done) {
      var bs = new BS({key: '__bs4', autoInit: true})
      bs.update()
        .then(done, done)
    })
  })

  context('disable', function() {
    it('should warn when disabled', function() {
      var spy = sinon.stub(console, 'warn')
      BS.__with__({_store: null})(function() {
        var bs = new BS({key: '_', autoInit: true})
        bs.updateSync()
        assert.equal(spy.callCount, 1)
      })
      spy.restore()
    })

    it('should cache', function() {
      var spy = sinon.stub(console, 'warn')
      BS.__with__({_store: null})(function() {
        var bs = new BS({key: '_', autoInit: true})
        bs.setSync('a', 1)
        assert.equal(bs.getSync('a'), 1)
      })
      spy.restore()
    })
  })
})
