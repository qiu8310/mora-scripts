declare namespace Events {
  type Handler = (this: Event, ...args: any[]) => void
  interface Event {
    type: string, namespace: string, data: any, once: boolean, handler: Handler
  }
}

/**
 * @example 直接使用
 * ```
 * var e = new Events()
 * e.on('click.namespace', function () { ... })
 * e.emit('click.namespace', 1, 2, 3)
 * ```
 *
 * @example 嫁接到函数或类上
 * ```
 * function Foo() { ... }
 * Events.mixin(Foo)
 * var f = new Foo()
 * f.on('click', ...)
 * f.emit('click', ...)
 * ```
 *
 * @example 嫁接到一个对象上
 * ```
 * var obj = {a: 'aa'}
 * Events.mixin(obj)
 * obj.on('click', ...)
 * obj.emit('click', ...)
 * ```
 */
declare class Events {
  /**
   * 使 target 拥有事件相关功能
   *
   * @param {object} target 要将事件相关的函数放置到的对象
   */
  static mixin<T>(target: T): T & Events

  _events: {[key: string]: Events}
  /**
   * 监听事件
   * @param {string} events 事件名称，类似于 jQuery，如果有多个要用空格隔开，也可以添加 namespace
   * @param {*} [data]
   * @param {function} handler
   * @param {boolean} [once] 是否只 handle 一次
   */
  on(events: string, data: any, handler: Events.Handler, once?: boolean): void

  /**
   * 监听事件
   * @param {string} events 事件名称，类似于 jQuery，如果有多个要用空格隔开，也可以添加 namespace
   * @param {function} handler
   * @param {boolean} [once] 是否只 handle 一次
   */
  on(events: string, handler: Events.Handler, once?: boolean): void

  /**
   * 监听事件，监听完后即销毁
   * @param {string} events 事件名称，类似于 jQuery，如果有多个要用空格隔开，也可以添加 namespace
   * @param {*} [data]
   * @param {function} handler
   */
  once(events: string, data: any, handler: Events.Handler): void

  /**
   * 监听事件，监听完后即销毁
   * @param {string} events 事件名称，类似于 jQuery，如果有多个要用空格隔开，也可以添加 namespace
   * @param {function} handler
   */
  once(events: string, handler: Events.Handler): void

  /**
   * @param {string} [events] 事件名称，类似于 jQuery，如果有多个要用空格隔开，也可以添加 namespace；
   *                          如果不指定 namespace，则会删除所有 namespace 下的相关的 handler;
   *                          如果不指定 events，则会删除所有事件
   * @param {function} [handler] 如果指定了，则删除对应的事件，否则删除所有匹配 events 的事件
   */
  off(events?: string, handler?: Events.Handler): void

  /**
   * @param {string} events 事件名称，类似于 jQuery，如果有多个要用空格隔开，也可以添加 namespace
   * @param {...*} args 函数列表，将会传给 handler
   */
  emit(events: string, ...args: any[]): void
}

export = Events
