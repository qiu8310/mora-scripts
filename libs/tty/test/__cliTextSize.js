var assert = require('assert')
var rewire = require('rewire')
var cliTextSize = rewire('../cliTextSize')

/* eslint-env mocha */

describe('libs/tty/cliTextSize', function() {
  it('should return 0 when it is a empty string', function() {
    assert.equal(cliTextSize(''), 0)
  })

  it('should return the length when it consist of alphas and numbers', function() {
    assert.equal(cliTextSize('1'), 1)
    assert.equal(cliTextSize('abc'), 3)
    assert.equal(cliTextSize('a34a'), 4)
  })

  it('should return the size after strip ansi code', function() {
    assert.equal(cliTextSize('\u001b[31ma\u001b[0m\u001b[0m'), 1)
  })

  it('should throws when include any of \\t, \\r, \\v, \\f, \\n', function() {
    assert.throws(function() { cliTextSize('\t') })
    assert.throws(function() { cliTextSize('\r') })
    assert.throws(function() { cliTextSize('\v') })
    assert.throws(function() { cliTextSize('\f') })
    assert.throws(function() { cliTextSize('\n') })
    assert.doesNotThrow(function() { cliTextSize('abc') })
  })

  it('when in windows', function() {
    cliTextSize.__with__({
      isWin: true,
      ambRanges: [[97], [98]],
      cp936Ranges: [[97], [99]]
    })(function() {
      assert.equal(cliTextSize('b'), 1, 'only amb') // window 无法表示这些字符
      assert.equal(cliTextSize('c'), 1, 'only cp936') // default size
      assert.equal(cliTextSize('a'), 2, 'both in amb and cp936')
    })
  })

  it('when not in windows', function() {
    cliTextSize.__with__({
      isWin: false,
      ambRanges: [[97], [98]],
      cp936Ranges: [[97], [99]]
    })(function() {
      assert.equal(cliTextSize('b'), 1, 'only amb')
      assert.equal(cliTextSize('c'), 1, 'only cp936')
      assert.equal(cliTextSize('a'), 1, 'both in amb and cp936')
    })
  })

  it('should return the size in sizeRangesMap but max is 2 when system is windows', function() {
    cliTextSize.__with__({
      isWin: true,
      sizeRangesMap: {'0': [[97]], '2': [[98]], '3': [[99, 100]]}
    })(function() {
      assert.equal(cliTextSize('a'), 0)
      assert.equal(cliTextSize('b'), 2)
      assert.equal(cliTextSize('c'), 2)
      assert.equal(cliTextSize('cd'), 4)
    })

    cliTextSize.__with__({
      isWin: false,
      sizeRangesMap: {'0': [[97]], '2': [[98]], '3': [[99, 100]]}
    })(function() {
      assert.equal(cliTextSize('a'), 0)
      assert.equal(cliTextSize('b'), 2)
      assert.equal(cliTextSize('c'), 3)
      assert.equal(cliTextSize('cd'), 6)
    })
  })
})
