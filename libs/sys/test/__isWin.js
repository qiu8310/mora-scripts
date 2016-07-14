var assert = require('assert')
var isWin = require('../isWin')

/* eslint-env mocha */

describe('libs/sys/isWin', function () {
  it('should be boolean', function () {
    assert.ok(typeof isWin === 'boolean')
  })
})
