var assert = require('assert')
var toString = require('../toString')

/* eslint-env mocha */

describe('libs/lang/toString', function () {

  it('should returns string wraped between "[object" and "]"', function () {
    assert.ok(/^\[object\s\w+\]$/.test(toString(1)))
    assert.ok(/^\[object\s\w+\]$/.test(toString(null)))
    assert.ok(/^\[object\s\w+\]$/.test(toString([])))
    assert.ok(/^\[object\s\w+\]$/.test(toString({})))
  })

})
