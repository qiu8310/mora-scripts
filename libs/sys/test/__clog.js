var assert = require('assert')
var sinon = require('sinon')
var util = require('util')
var clog = require('../clog')
var format = clog.format

/* eslint-env mocha */

describe('libs/sys/clog', function() {
  it('should call console.log', function() {
    var spy = sinon.stub(console, 'log').callsFake(function() {})
    clog()
    clog('aa')

    assert.ok(spy.calledTwice)
    spy.restore()
  })

  it('should have format function', function() {
    assert.equal(typeof clog.format, 'function')
    assert.equal(clog.format('ab'), util.format('ab') + '\u001b[0m\u001b[0m')
  })

  context('parser', function() {
    it('foreground', function() {
      var expected = '\u001b[31ma\u001b[0m\u001b[0m'
      assert.equal(format('%ca', 'red'), expected, 'default')
      assert.equal(format('%ca', 'fg.red'), expected, 'prefix fg')
      assert.equal(format('%ca', 'foreground.red'), expected, 'prefix foreground')
      assert.equal(format('%ca', 'c.red'), expected, 'prefix c')
      assert.equal(format('%ca', 'color.red'), expected, 'prefix color')
    })
    it('background', function() {
      var expected = '\u001b[41ma\u001b[0m\u001b[0m'
      assert.equal(format('%ca', 'bg.red'), expected, 'prefix bg')
      assert.equal(format('%ca', 'bgRed'), expected, 'prefix bg')
      assert.equal(format('%ca', 'background.red'), expected, 'prefix background')
      assert.equal(format('%ca', 'backgroundRed'), expected, 'prefix background')
    })
    it('low color', function() {
      var expected = '\u001b[31ma\u001b[0m\u001b[0m'
      assert.equal(format('%ca', 'red'), expected, 'default')
      assert.equal(format('%ca', 'l.red'), expected, 'prefix l')
      assert.equal(format('%ca', 'low.red'), expected, 'prefix low')
    })
    it('high color', function() {
      var expected = '\u001b[91ma\u001b[0m\u001b[0m'
      assert.equal(format('%ca', 'h.red'), expected, 'prefix h')
      assert.equal(format('%ca', 'high.red'), expected, 'prefix high')
    })
    it('default color', function() {
      var expectedDefaultFG = '\u001b[39ma\u001b[0m\u001b[0m'
      var expectedDefaultBG = '\u001b[49ma\u001b[0m\u001b[0m'

      assert.equal(format('%ca', 'default'), expectedDefaultFG)
      assert.equal(format('%ca', 'bg.default'), expectedDefaultBG)
    })
    it('hex color', function() {
      var expected = '\u001b[38;5;196ma\u001b[0m\u001b[0m'
      assert.equal(format('%ca', '#F00'), expected, 'short hex')
      assert.equal(format('%ca', 'F00'), expected, 'short hex without #')
      assert.equal(format('%ca', '#FF0000'), expected, 'long hex')
      assert.equal(format('%ca', 'FF0000'), expected, 'long hex without #')
    })
    it('css color', function() {
      var expectedFG = '\u001b[31ma\u001b[0m\u001b[0m'
      var expectedBG = '\u001b[41ma\u001b[0m\u001b[0m'
      var expectedHEX = '\u001b[38;5;196ma\u001b[0m\u001b[0m'

      assert.equal(format('%ca', '{color: "red"}'), expectedFG)
      assert.equal(format('%ca', 'color: "red"'), expectedFG)
      assert.equal(format('%ca', 'color: red'), expectedFG)
      assert.equal(format('%ca', '{background: "red"}'), expectedBG)
      assert.equal(format('%ca', 'background: "red"'), expectedBG)
      assert.equal(format('%ca', 'background: red'), expectedBG)
      assert.equal(format('%ca', '{color: "#F00"}'), expectedHEX)
      assert.equal(format('%ca', 'color: "#FF0000"'), expectedHEX)
      assert.equal(format('%ca', 'color: FF0000'), expectedHEX)
    })
    it('names', function() {
      var expectedFGBrown = '\u001b[38;5;131ma\u001b[0m\u001b[0m'
      var expectedBGBrown = '\u001b[48;5;131ma\u001b[0m\u001b[0m'

      assert.equal(format('%ca', 'brown'), expectedFGBrown)
      assert.equal(format('%ca', 'fg.brown'), expectedFGBrown, 'prefix fg')
      assert.equal(format('%ca', 'bg.brown'), expectedBGBrown, 'prefix bg')
    })
    it('modifiers', function() {
      var expected = '\u001b[3ma\u001b[0m\u001b[0m'

      assert.equal(format('%ca', 'italic'), expected)
    })
    it('reset', function() {
      var expectedModifier = '\u001b[23ma\u001b[0m\u001b[0m'
      var expectedEnd = '\u001b[0ma\u001b[0m\u001b[0m'

      assert.equal(format('%ca', 'resetItalic'), expectedModifier, 'reset modifier')
      assert.equal(format('%ca', 'reset'), expectedEnd, 'reset all')
      assert.equal(format('%ca', 'end'), expectedEnd, 'reset all with end')
    })
    it('raw', function() {
      var expected = '\u001b[xxxma\u001b[0m\u001b[0m'
      assert.equal(format('%ca', 'xxx'), expected)
    })
  })

  context('config', function() {
    it('check default value', function() {
      assert.equal(clog.autoResetAtEnd, true)
      assert.equal(clog.autoResetAtGroupEnd, true)
      assert.ok('brown' in clog.NAMED_COLORS)
    })
    it('disable autoResetAtEnd', function() {
      switchProp('autoResetAtEnd', false)
      var expected = '\u001b[31ma\u001b[0m'
      var expected2 = expected + ' ' + expected
      assert.equal(format('%ca', 'red'), expected)
      assert.equal(format('%ca', 'red', '%ca', 'red'), expected2)
      switchProp('autoResetAtEnd')
    })
    it('disable autoResetAtGroupEnd', function() {
      switchProp('autoResetAtGroupEnd', false)
      var expected = '\u001b[31ma\u001b[0m'
      var expected2 = '\u001b[31ma \u001b[31ma\u001b[0m'
      assert.equal(format('%ca', 'red'), expected)
      assert.equal(format('%ca', 'red', '%ca', 'red'), expected2)
      switchProp('autoResetAtGroupEnd')
    })
    it('disable autoResetAtEnd and autoResetAtGroupEnd', function() {
      switchProp('autoResetAtEnd', false)
      switchProp('autoResetAtGroupEnd', false)

      var expected = '\u001b[31ma'
      var expected2 = '\u001b[31ma \u001b[31ma'
      assert.equal(format('%ca', 'red'), expected)
      assert.equal(format('%ca', 'red', '%ca', 'red'), expected2)

      switchProp('autoResetAtEnd')
      switchProp('autoResetAtGroupEnd')
    })
    it('NAMED_COLORS', function() {
      var NAMED_COLORS = { foo: clog.NAMED_COLORS.brown }
      clog.NAMED_COLORS = NAMED_COLORS

      var expectedBrown = '\u001b[38;5;131ma\u001b[0m\u001b[0m'
      var expectedNoBrown = '\u001b[brownma\u001b[0m\u001b[0m'

      assert.equal(format('%ca', 'foo'), expectedBrown)
      assert.equal(format('%ca', 'brown'), expectedNoBrown)
    })
  })

  context('mixed', function() {
    it('should reset when format a colored string', function() {
      var reset = '\u001b[0m'
      var redB = '\u001b[31mb'
      var normalB = 'b'

      var coloredExpected = 'a' + redB + reset + 'c' + reset + reset
      var normalExpected = 'abc' + reset + reset

      assert.equal(format('a%sc', redB), coloredExpected)
      assert.equal(format('a%sc', normalB), normalExpected)
    })

    it('should support mix foreground and background', function() {
      var expected = '\u001b[31m\u001b[41ma\u001b[0m\u001b[0m'
      assert.equal(format('%ca', 'fg.red; bg.red'), expected)
    })
  })
})

function switchProp(prop, value) {
  var oldProp = 'old_' + prop
  if (value != null) {
    clog[oldProp] = clog[prop]
    clog[prop] = value
  } else {
    clog[prop] = clog[oldProp]
    delete clog[oldProp]
  }
}
