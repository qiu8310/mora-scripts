
export interface IDotPropData {
  [key: string]: any
}
export declare class DotProp {
  /**
   * 判断数据池 obj 中是否有路径 path
   *
   * @static
   * @param  {Object}  obj  数据池
   * @param  {String}  path 路径
   * @return {Boolean}
   *
   * @author Zhonglei Qiu
   * @since 2.0.0
   */
  static has(obj: IDotPropData, path: string): boolean

  /**
   * 获取数据池 obj 中的路径 path 中的值
   *
   * @static
   * @param  {Object}  obj  数据池
   * @param  {String}  path 路径
   * @return {*}       获取到的值或者 `undefined`
   *
   * @author Zhonglei Qiu
   * @since 2.0.0
   */
  static get(obj: IDotPropData, path: string): any

  /**
   * 删除数据池 obj 中的路径 path
   *
   * @static
   * @param  {Object}  obj  数据池
   * @param  {String}  path 路径
   * @return {Boolean} 是否删除成功
   *
   * @author Zhonglei Qiu
   * @since 2.0.0
   */
  static del(obj: IDotPropData, path: string): boolean
  /**
   * 设置数据池 obj 中路径 path 的值为 value
   *
   * @static
   * @param  {Object}  obj   数据池
   * @param  {String}  path  路径
   * @param  {*}       value 要设置的值
   * @return {Boolean} 是否设置成功
   *
   * @author Zhonglei Qiu
   * @since 2.0.0
   */
  static set(obj: IDotPropData, path: string, value: any): boolean


  data: IDotPropData
  constructor(data: IDotPropData)

  /**
   * 判断数据池中是否有路径 path
   *
   * @param  {String}  path 路径
   * @return {Boolean}
   *
   * @author Zhonglei Qiu
   * @since 2.0.0
   */
  has(path: string): boolean

  /**
   * 获取数据池中路径为 path 的值
   * @param  {String} path  路径
   * @return {*}
   *
   * @author Zhonglei Qiu
   * @since 2.0.0
   */
  get(path: string): any

  /**
   * 删除数据池中的路径上的值
   * @param  {String} path  路径
   * @return {Boolean}      是否删除成功
   *
   * @author Zhonglei Qiu
   * @since 2.0.0
   */
  del(path: string): boolean

  /**
   * 设置数据池中路径为 path 的值，如果中间的路径不存在，
   * 或者不为 Object，则自动添加或修改成 Object
   *
   * @param  {String} path    路径
   * @param  {String} value   要设置的值
   * @return {Boolean}        是否设置成功（当 p 不为字符串时设置不成功）
   *
   * @author Zhonglei Qiu
   * @since 2.0.0
   */
  set(path: string, value: any): boolean

}

/**
 * @example 直接使用
 * var e = new Events()
 * e.on('click.namespace', function () { ... })
 * e.emit('click.namespace', 1, 2, 3)
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
export declare class Events {
  /**
   * 使 target 拥有事件相关功能
   *
   * @param {object} target 要将事件相关的函数放置到的对象
   */
  static mixin<T>(target: T): T & Events

  _events: {[key: string]: IEventsEvent}
  /**
   * 监听事件
   * @param {string} events 事件名称，类似于 jQuery，如果有多个要用空格隔开，也可以添加 namespace
   * @param {*} [data]
   * @param {function} handler
   * @param {boolean} [once] 是否只 handle 一次
   */
  on(events: string, data: any, handler: IEventsHandler, once?: boolean): void

  /**
   * 监听事件
   * @param {string} events 事件名称，类似于 jQuery，如果有多个要用空格隔开，也可以添加 namespace
   * @param {function} handler
   * @param {boolean} [once] 是否只 handle 一次
   */
  on(events: string, handler: IEventsHandler, once?: boolean): void

  /**
   * 监听事件，监听完后即销毁
   * @param {string} events 事件名称，类似于 jQuery，如果有多个要用空格隔开，也可以添加 namespace
   * @param {*} [data]
   * @param {function} handler
   */
  once(events: string, data: any, handler: IEventsHandler): void

  /**
   * 监听事件，监听完后即销毁
   * @param {string} events 事件名称，类似于 jQuery，如果有多个要用空格隔开，也可以添加 namespace
   * @param {function} handler
   */
  once(events: string, handler: IEventsHandler): void

  /**
   * @param {string} [events] 事件名称，类似于 jQuery，如果有多个要用空格隔开，也可以添加 namespace；
   *                          如果不指定 namespace，则会删除所有 namespace 下的相关的 handler;
   *                          如果不指定 events，则会删除所有事件
   * @param {function} [handler] 如果指定了，则删除对应的事件，否则删除所有匹配 events 的事件
   */
  off(events?: string, handler?: IEventsHandler): void

  /**
   * @param {string} events 事件名称，类似于 jQuery，如果有多个要用空格隔开，也可以添加 namespace
   * @param {...*} args 函数列表，将会传给 handler
   */
  emit(events?: string, ...args: any[]): void


}

export interface IEventsEvent {
  type: string, namespace: string, data: any, once: boolean, handler: IEventsHandler
}
export declare type IEventsHandler = (this: IEventsEvent, ...args: any[]) => void
