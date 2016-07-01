var assert = require('assert')
var escapeRegExp = require('../escapeRegExp')

/* eslint-env mocha */

describe('libs/lang/escapeRegExp', function () {
  it('should escape regexp keywords', function () {
    assert.equal(escapeRegExp('(['), '\\(\\[')
  })
  it('should not escape no regexp keywords', function () {
    assert.equal(escapeRegExp('a1'), 'a1')
  })
  it('should exports the regexp it use', function () {
    assert.ok(escapeRegExp.re)
    assert.ok(escapeRegExp.gre)
  })
})
