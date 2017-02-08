var assert = require('assert')
var table = require('rewire')('../table')

/* eslint-env mocha */

describe('libs/tty/table', function() {
  before(function() {
    table.__set__('os.EOL', '\n')
  })
  after(function() {
    table.__set__('os.EOL', require('os').EOL)
  })

  it('should return empty string when there is no array items', function() {
    assert.equal(table(false), '')
    assert.equal(table(null), '')
    assert.equal(table([]), '')
    assert.equal(table([[]]), '')
    assert.equal(table('aa'), '')
    assert.equal(table(['aa']), '')
  })

  it('handle special chars \\r \\v \\f \\t \\n', function() {
    assert.equal(table([['\r\v\f']]), '', 'remove \\r\\v\\f')
    assert.equal(table([['\t']]), '    ', 'replace \\t with four space')
    assert.equal(table([['a\nb']]), 'a\nb', 'reverse \\n')
  })

  it('single row', function() {
    assert.equal(table([['aa']]), 'aa')
    assert.equal(table([['aa', 'bb']]), 'aabb')
    assert.equal(table([['aa', 'bb', 'cc']]), 'aabbcc')
  })

  it('single row with color', function() {
    var y = '\x1b[33m'
    var r = '\x1b[0m'

    assert.equal(table([['a' + y + 'b', 'c']]), 'a' + y + 'b' + r + 'c')
    assert.equal(table([['a' + y + '\nb', 'c\nd']]), 'a' + y + r + 'c\n' + y + 'b' + r + 'd')
  })

  it('single row with overflow', function() {
    table.__with__({
      SCREEN_WIDTH: 3,
      MIN_OVERFLOW_CELL_WIDTH: 1 // 实际情况此值不能小于 2
    })(function() {
      assert.equal(table([['bb', 'cc']]), 'bbc\n  c', 'equal width, last cell will be splited')
      assert.equal(table([['bbb', 'cc']]), 'bcc\nb  \nb  ', 'not equal width, max width will be splited')
      assert.equal(table([['aa', 'b中']]), 'aab\n  中')
    })
  })

  it('single row with overflow and color', function() {
    var y = '\x1b[33m'
    var r = '\x1b[0m'

    table.__with__({
      SCREEN_WIDTH: 3,
      MIN_OVERFLOW_CELL_WIDTH: 1
    })(function() {
      assert.equal(table([['a', 'b' + y + 'b', 'c']]), 'abc\n ' + y + 'b' + r + ' ')
      assert.equal(table([['a', 'bb' + y, 'c']]), 'abc\n b' + y + r + ' ')
    })
  })

  it('multiple row with overflow', function() {
    table.__with__({
      SCREEN_WIDTH: 2,
      MIN_OVERFLOW_CELL_WIDTH: 1
    })(function() {
      assert.equal(table([['aa', 'b'], ['c', 'd']]), 'ab\na \ncd')
    })
  })
})
