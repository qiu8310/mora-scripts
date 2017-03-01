/**
 *
 * @module      libs/lang/Events
 * @createdAt   2017-03-01
 *
 * @copyright   Copyright (c) 2017 Zhonglei Qiu
 * @license     Licensed under the MIT license.
 */

/**
 * @class
 * @example 直接使用
 * var e = new Events()
 * e.on('click', function () { ... })
 * e.emit('click', 1, 2, 3)
 *
 * @example 嫁接到函数或类上
 * function Foo() { ... }
 * Events.mixin(Foo)
 * var f = new Foo()
 * f.on('click', ...)
 * f.emit('click', ...)
 *
 * @example 嫁接到一个对象上
 * var obj = {a: 'aa'}
 * Events.mixin(obj)
 * obj.on('click', ...)
 * obj.emit('click', ...)
 */
function Events() {
  this._events = {}
}

/**
 * @param {string} events 事件名称，类似于 jQuery，如果有多个要用空格隔开，也可以添加 namespace
 * @param {*} [data]
 * @param {function} handler
 * @param {boolean} [once]
 */
Events.prototype.on = function(events, data, handler, once) {
  var store = this._events
  if (typeof data === 'function') {
    once = handler
    handler = data
    data = void 0
  }
  parseEventsString(events).forEach(function(event) {
    store[event.type] = store[event.type] || []
    event.handler = handler
    event.data = data
    event.once = !!once
    store[event.type].push(event)
  })
}

/**
 * 和 Events.on 类似，只不过它执行完马上就会被销毁
 * @borrows Events.on
 */
Events.prototype.once = function(events, data, handler) {
  this.on.apply(this, Array.prototype.slice.call(arguments).concat(true))
}

/**
 * @param {string} [events] 事件名称，类似于 jQuery，如果有多个要用空格隔开，也可以添加 namespace；
 *                          如果不指定 namespace，则会删除所有 namespace 下的相关的 handler;
 *                          如果不指定 events，则会删除所有事件
 * @param {function} [handler] 如果指定了，则删除对应的事件，否则删除所有匹配 events 的事件
 */
Events.prototype.off = function(events, handler) {
  var store = this._events
  if (events == null) {
    this._events = {}
    return
  }
  parseEventsString(events).forEach(function(event) {
    store[event.type] = (store[event.type] || []).filter(function(storeEvent) {
      var isHandlerMatch = !handler || handler === storeEvent.handler
      var isNamespaceMatch = !event.namespace || event.namespace === storeEvent.namespace
      return !isHandlerMatch || !isNamespaceMatch
    })
  })
}

/**
 * @param {string} events 事件名称，类似于 jQuery，如果有多个要用空格隔开，也可以添加 namespace
 * @param {...*} args 函数列表，将会传给 handler
 */
Events.prototype.emit = function(events, args) {
  var store = this._events
  args = Array.prototype.slice.call(arguments, 1)

  setTimeout(function() {
    parseEventsString(events).forEach(function(event) {
      store[event.type] = (store[event.type] || []).filter(function(storeEvent) {
        if (!event.namespace || event.namespace === storeEvent.namespace) {
          storeEvent.handler.apply(storeEvent, args)
          return !storeEvent.once
        }
        return true
      })
    })
  }, 0)
}

/**
 * 使 target 拥有事件相关功能
 *
 * @param {object} target 要将事件相关的函数放置到的对象
 */
Events.mixin = function(target) {
  var props = ['on', 'once', 'off', 'emit']
  var ref = typeof target === 'function' ? target.prototype : target
  var prop = '_events'
  if (prop in ref) warnPropExists(target, prop) // 避免 _events 名称被占用了

  Events.call(ref)
  for (var i = 0; i < props.length; i++) {
    prop = props[i]
    if (prop in ref) warnPropExists(target, prop)
    ref[prop] = Events.prototype[prop]
  }
}

function parseEventsString(events) {
  var i, parts
  var result = []
  events = events.split(/\s+/)
  for (i = 0; i < events.length; i++) {
    parts = events[i].split('.')
    result[i] = {type: parts[0], namespace: parts.slice(1).join('.')}
  }
  return result
}

function warnPropExists(target, prop) {
  console.warn('Target %o has already contains property %o, it will be overwrited!', target, prop)
}

module.exports = Events
