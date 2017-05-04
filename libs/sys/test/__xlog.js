var sinon = require('sinon')
var assert = require('assert')
var xlog = require('../xlog')

/* eslint-env mocha */

describe('libs/sys/xlog', function() {
  before(function() {
    xlog.autoResetAtEnd = false
    xlog.autoResetAtGroupEnd = false
  })
  after(function() {
    xlog.autoResetAtEnd = true
    xlog.autoResetAtGroupEnd = true
  })

  context('basic', function() {
    it('should call console.log', function() {
      var spy = sinon.stub(console, 'log').callsFake(function() {})
      xlog()
      xlog('aa')
      assert.ok(spy.calledTwice)
      spy.restore()
    })

    it('should have format function', function() {
      assert.equal(typeof xlog.format, 'function')
    })

    it('should have align function', function() {
      assert.equal(typeof xlog.align, 'function')
    })
  })

  context('format', function() {
    it('object', function() {
      var obj = {foo: 1}
      var expected = '{"foo":1}'
      assert.equal(xlog.format('%j', obj), expected)
      assert.equal(xlog.format('%o', obj), expected)
    })
    it('string', function() {
      assert.equal(xlog.format('%s', true), 'true')
      assert.equal(xlog.format('%s', null), 'null')
      assert.equal(xlog.format('a%sc', 'b'), 'abc')
    })
    it('integer', function() {
      assert.equal(xlog.format('%d', 20), '20')
      assert.equal(xlog.format('%d', 20.23), '20')
      assert.equal(xlog.format('%d', '20xx'), '20')
      assert.equal(xlog.format('x %d a', 'x 20 a'), 'x NaN a')
    })
    it('float', function() {
      assert.equal(xlog.format('%f', '20'), '20')
      assert.equal(xlog.format('%f', '20.02'), '20.02')
      assert.equal(xlog.format('%f', 20.2), '20.2')
      assert.equal(xlog.format('%3f', 20.2), '20.200')
    })
  })

  context('align', function() {
    it('left', function() {
      assert.equal(xlog.format('%s', 'a'), 'a')
      assert.equal(xlog.format('%3s', 'a'), '  a')
      assert.equal(xlog.format('%4s', 'a'), '   a')
      assert.equal(xlog.format('%3.s', 'ab'), ' ab')
      assert.equal(xlog.format('%3s', 'abc'), 'abc')
      assert.equal(xlog.format('%2s', 'abc'), 'abc')
    })
    it('left with specified pad', function() {
      assert.equal(xlog.format('%3:_s', 'a'), '__a')
      assert.equal(xlog.format('%3: s', 'a'), '  a')
      assert.equal(xlog.format('%3::s', 'ax'), ':ax')
    })

    it('right', function() {
      assert.equal(xlog.format('%.3s', 'a'), 'a  ')
      assert.equal(xlog.format('%.4s', 'a'), 'a   ')
      assert.equal(xlog.format('%0.3s', 'ab'), 'ab ')
      assert.equal(xlog.format('%0.3s', 'abc'), 'abc')
      assert.equal(xlog.format('%0.2s', 'abc'), 'abc')
    })
    it('right with specified pad', function() {
      assert.equal(xlog.format('%.3:._s', 'a'), 'a__')
      assert.equal(xlog.format('%.3:. s', 'a'), 'a  ')
      assert.equal(xlog.format('%.3:.:s', 'ax'), 'ax:')
    })

    it('left & right', function() {
      assert.equal(xlog.format('%2.2s', 'a'), '  a ')
      assert.equal(xlog.format('%1.3s', 'a'), ' a  ')
      assert.equal(xlog.format('%3.2s', 'a'), '  a  ')
      assert.equal(xlog.format('%1.1s', 'a'), ' a')
      assert.equal(xlog.format('%1.1s', 'ab'), 'ab')
      assert.equal(xlog.format('%1.1s', 'abc'), 'abc')
    })
    it('left & right with specified pad', function() {
      assert.equal(xlog.format('%3.3:-.-s', 'ab'), '--ab--')
      assert.equal(xlog.format('%3.3:_.-s', 'ab'), '__ab--')
      assert.equal(xlog.format('%3.3:-.s', 'ab'), '--ab  ')
      assert.equal(xlog.format('%3.3:.-s', 'ab'), '  ab--')
    })
  })

  context('clog features', function() {
    it('extends all properties in clog', function() {
      assert.ok('autoResetAtEnd' in xlog)
      assert.ok('autoResetAtGroupEnd' in xlog)
      assert.ok('NAMED_COLORS' in xlog)

      assert.equal(typeof xlog.autoResetAtEnd, 'boolean')
      assert.equal(typeof xlog.autoResetAtGroupEnd, 'boolean')
      assert.equal(typeof xlog.NAMED_COLORS, 'object')
    })

    it('disable clog.autoResetAtEnd', function() {
      var expected = '\u001b[31ma'
      var expected2 = expected + ' ' + expected
      assert.equal(xlog.format('%ca', 'red'), expected)
      assert.equal(xlog.format('%ca', 'red', '%ca', 'red'), expected2)
    })
  })
})
