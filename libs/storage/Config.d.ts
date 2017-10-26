import * as Storage from './Storage'
import * as DotProp from '../lang/DotProp'

declare class Config {
  storage: Storage
  dp: DotProp
  constructor(storage: Storage)

  /**
   * 判断数据池中是否有路径 path
   *
   * @param  {String}  path 路径
   * @return {Boolean}
   */
  has(path: string): boolean

  /**
   * 获取数据池中路径为 path 的值
   * @param  {String} path  路径
   * @return {*}
   */
  get(path: string): any

  /**
   * 删除数据池中的路径上的值
   * @param  {String} path  路径
   * @return {Boolean}      是否删除成功
   */
  del(path: string): boolean

  /**
   * 设置数据池中路径为 path 的值，如果中间的路径不存在，
   * 或者不为 Object，则自动添加或修改成 Object
   *
   * @param  {String} path    路径
   * @param  {String} value   要设置的值
   * @return {Boolean}        是否设置成功（当 p 不为字符串时设置不成功）
   */
  set(path: string, value: any): boolean

}

declare namespace Config {}

export = Config
