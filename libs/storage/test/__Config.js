var assert = require('assert')
var Config = require('../Config')
var Storage = require('../Storage')

/* eslint-env mocha */

describe('libs/storage/Config', function() {
  it('manual init storage', function() {
    var s = new Storage()
    s.initSync({foo: true})
    var c = new Config(s)

    assert.equal(c.get('foo'), true)
    assert.equal(c.get('foo.bar'), undefined)
    assert.equal(c.has('foo'), true)
    assert.equal(c.has('foo.bar'), false)

    assert.equal(c.set('foo.bar', 1), true)
    assert.equal(c.get('foo.bar'), 1)
    assert.equal(typeof c.get('foo'), 'object')

    assert.equal(s.data, c.dp.data)
  })

  it('auto init storage', function() {
    var s = new Storage()
    var c = new Config(s)

    assert.equal(c.del('foo'), false, 'del failed')
    assert.equal(c.set('foo.bar', 1), true, 'set successed')
    assert.equal(c.del('foo'), true, 'del successed')
    assert.equal(c.get('foo'), undefined, 'del successed')

    assert.equal(c.set(null, 1), false, 'set failed')

    assert.equal(s.data, c.dp.data)
  })
})
