var assert = require('assert')
var formatDate = require('../formatDate')

/* eslint-env mocha */

describe('libs/lang/formatDate', function () {

  it('should format specified date', function () {
    var date = new Date('2016-07-14 16:05:06')
    var X = date.getTime()
    var x = Math.round(X / 1000)

    var format = 'fooyyyy-yy-mm-m-d-dd-HH-H-h-hh-a-A-i-ii-s-ss-MM-M-D-DD-Do-x-X'
    var expect = 'foo2016-16-07-7-14-14-16-16-4-04-pm-PM-5-05-6-06-July-Jul-Thu-Thursday-14th-' + x + '-' + X
    assert.equal(formatDate(date, format), expect)
  })

  it('should format current date', function () {
    var date = new Date()
    assert.equal(formatDate('yyyy'), date.getFullYear())
  })

  it('should format day of month', function () {
    assert.equal(formatDate(new Date('2016-01-01'), 'Do'), '1st')
    assert.equal(formatDate(new Date('2016-01-02'), 'Do'), '2nd')
    assert.equal(formatDate(new Date('2016-01-03'), 'Do'), '3rd')
    assert.equal(formatDate(new Date('2016-01-11'), 'Do'), '11th')
    assert.equal(formatDate(new Date('2016-01-12'), 'Do'), '12th')
    assert.equal(formatDate(new Date('2016-01-13'), 'Do'), '13th')
    assert.equal(formatDate(new Date('2016-01-21'), 'Do'), '21st')
    assert.equal(formatDate(new Date('2016-01-22'), 'Do'), '22nd')
    assert.equal(formatDate(new Date('2016-01-23'), 'Do'), '23rd')
    assert.equal(formatDate(new Date('2016-01-24'), 'Do'), '24th')
  })

})
