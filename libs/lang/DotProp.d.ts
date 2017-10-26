declare namespace DotProp {
  interface Data {
    [key: string]: any
  }
}

declare class DotProp {
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
  static has(obj: DotProp.Data, path: string): boolean

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
  static get(obj: DotProp.Data, path: string): any

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
  static del(obj: DotProp.Data, path: string): boolean
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
  static set(obj: DotProp.Data, path: string, value: any): boolean


  data: DotProp.Data
  constructor(data: DotProp.Data)

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

export = DotProp
