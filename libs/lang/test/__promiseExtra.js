var assert = require('assert')
require('../promiseExtra')

/* eslint-env mocha */

describe('libs/lang/promiseExtra', function() {
  context('finally', function() {
    it('should exists', function() {
      assert.ok(Promise.prototype.finally)
    })

    it('should called on resolve', function(done) {
      new Promise(function(resolve) { resolve(12) })
        .finally(function(d) {
          assert.equal(d, undefined)
        })
        .then(function(d) {
          assert.equal(d, 12)
          done()
        })
    })

    it('should called on reject', function(done) {
      Promise.reject(12)
        .finally(function(d) {
          assert.equal(d, undefined)
        })
        .catch(function(d) {
          assert.equal(d, 12)
          done()
        })
    })
  })

  context('try', function() {
    it('should exists', function() {
      assert.ok(Promise.try)
    })

    it('should return promise', function(done) {
      Promise
        .try(function() {
          return 12
        })
        .then(function(d) {
          assert.ok(d, 12)
          done()
        })
    })

    it('should reject when throws', function(done) {
      Promise
        .try(function() {
          throw new Error('x')
        })
        .catch(function(e) {
          assert.ok(e.message, 'x')
          done()
        })
    })
  })
})
