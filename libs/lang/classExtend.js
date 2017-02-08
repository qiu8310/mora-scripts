/**
 * @module      libs/lang/classExtend
 * @createdAt   2016-07-21
 *
 * @copyright   Copyright (c) 2016 Zhonglei Qiu
 * @license     Licensed under the MIT license.
 */

var assign = require('./assign')
var hasOwnProp = require('./hasOwnProp')

/**
 * Base class
 * @class
 * @see [class-extend@0.1.2]{@link https://github.com/SBoudrias/class-extend/tree/v0.1.2}
 *
 * @example
 *
 * var Base = require('classExtend')
 * var Sub = Base.extend(protoProps, staticProps)
 */
function Base() {}

/**
 * Extend this Class to create a new one inherithing this one.
 * Also add a helper __super__ object poiting to the parent prototypes methods
 *
 * @param  {Object} protoProps  Prototype properties (available on the instances)
 * @param  {Object} staticProps Static properties (available on the contructor)
 * @return {Object}             New sub class
 *
 * @example
 *
 * // 1. Extend from the blank class
 * var Base = require('classExtend')
 * var Sub = Base.extend()
 *
 * // 2. Add the .extend helper to a class
 * MyClass.extend = require('classExtend').extend
 *
 */
Base.extend = function(protoProps, staticProps) {
  var parent = this
  var child

  // The constructor function for the new subclass is either defined by you
  // (the "constructor" property in your `extend` definition), or defaulted
  // by us to simply call the parent's constructor.
  if (protoProps && hasOwnProp(protoProps, 'constructor')) {
    child = protoProps.constructor
  } else {
    child = function() { return parent.apply(this, arguments) }
  }

  // Add static properties to the constructor function, if supplied.
  assign(child, parent, staticProps)

  // Set the prototype chain to inherit from `parent`
  child.prototype = Object.create(parent.prototype, {
    constructor: {
      value: child,
      enumerable: false,
      writable: true,
      configurable: true
    }
  })

  // Add prototype properties (instance properties) to the subclass,
  // if supplied.
  if (protoProps) assign(child.prototype, protoProps)

  // Set a convenience property in case the parent's prototype is needed
  // later.
  child.__super__ = parent.prototype
  return child
}

module.exports = Base
