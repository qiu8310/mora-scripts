interface Interface {
  /**
   * 判断 obj 对象是否含有某个 key，且 key 需要 enumerable （ 利用 getOwnPropertyDescriptor ）
   *
   * 另外也可以使用 Object.prototype.propertyIsEnumerable.call(obj, key)
   *
   * @param   {Object} obj
   * @param   {String} key
   * @return  {Boolean}
   *
   * @author  Zhonglei Qiu
   * @since   2.0.0
   */
  (obj: any, key: string): boolean
}

declare const instance: Interface
export = instance
