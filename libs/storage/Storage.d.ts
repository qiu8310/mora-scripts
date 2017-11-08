declare namespace Storage {
  interface Options {
    /**
     * 指定 toString 调用 JSON.stringify 时的格式
     */
    format?: number

    /**
     * 在 constructor 内部调用 this.initSync 方法
     */
    autoInit?: boolean
  }
}

declare class Storage {
  static extend(storageLikeObject: any): Storage

  constructor(options?: Storage.Options)

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
  setSync(key: string, value: any): void

  del(key: string): Promise<void>
  delSync(key: string): void

  update(): Promise<void>
  updateSync(): void

  toJSON(): {[key: string]: any}
  toString(): string
}

export = Storage
