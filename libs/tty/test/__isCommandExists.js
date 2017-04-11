var assert = require('assert')
var isWin = require('../../sys/isWin')
var isCommandExists = require('../isCommandExists')

/* eslint-env mocha */

describe('libs/tty/isCommandExists', function() {
  it('command "ls" should exists in unix', function() {
    if (!isWin) {
      // 别名像 ll 是会返回 false
      // console.log(isCommandExists('ll'))
      assert.equal(isCommandExists('ls'), true)
    }
  })

  it('command "_xx_ls" should exists in unix', function() {
    if (!isWin) {
      assert.equal(isCommandExists('_xx_ls'), false)
    }
  })
})
