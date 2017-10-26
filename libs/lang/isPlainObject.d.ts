interface Interface {
  /**
   * 判断 obj 是不是一个原生的 Object，一般也叫做 PlainObject
   *
   * @param   {*}      obj   任何的 JS 类型
   * @return  Boolean
   *
   * @author  Zhonglei Qiu
   * @since   2.0.0
   */
  (obj: any): boolean
}

declare const instance: Interface
export = instance
