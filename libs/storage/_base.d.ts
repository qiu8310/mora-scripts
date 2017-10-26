import {DotProp} from '../lang/_base'

export interface IStorageOptions {
  /**
   * 指定 toString 调用 JSON.stringify 时的格式
   */
  format?: number

  /**
   * 在 constructor 内部调用 this.initSync 方法
   */
  autoInit?: boolean
}

export interface IFileStorageOptions {
  /**
   * 指定要存储到的文件
   */
  file: string
}
export interface IBrowserStorageOptions {
  /**
   * 指定要存储到的 localStorage 的 key
   */
  key: string
}
export declare class Storage {
  static extend(storageLikeObject): Storage

  constructor(options?: IStorageOptions)

  /**
   * 对指定的 key 做 defineProperty 操作，之后就可以通过
   * storage.key 或 storage.key = 'xx' 的形式来对 stroage
   * 中的数据进行修改。
   *
   * 主要是采用了 Storage.getSync 和 Storage.setSync 方法
   *
   * @param  {Array<String>|String} [keys]   要操作的 keys，如果不指定，则会对 data 中的所有 keys 处理
   * @param  {Boolean}              silent   是否禁止输出提醒信息（主要是 defineProperty 会出现 key 已经存在的问题）
   * @return {Storage}
   */
  define(keys: string[], silent: boolean): Storage

  /** 异步初始化，生成 data */
  init(): Promise<void>
  /** 同步初始化，生成 data */
  initSync(): void

  has(key: string): Promise<boolean>
  hasSync(key: string): boolean

  get(key: string): Promise<any>
  getSync(key: string): any

  set(key: string, value: any): Promise<void>
  setSync(key: string, value: any)

  del(key: string): Promise<void>
  delSync(key: string): void

  update(): Promise<void>
  updateSync(): void

  toJSON(): {[key: string]: any}
  toString(): string
}

export declare class FileStorage extends Storage {
  constructor(IFileStorageOptions)
}
export declare class BrowserStorage extends Storage {
  constructor(IBrowserStorageOptions)
}

export declare class Config {
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
