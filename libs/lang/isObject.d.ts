interface Interface {
  /**
   * 判断 obj 是不是一个 JS Object
   *
   * 除了 null, 及字面量，其它一般都是 Object，包括 函数
   *
   * @param   {*}      obj   任何的 JS 类型
   * @return  Boolean
   *
   * @see     [is-obj@1.0.1]{@link https://github.com/sindresorhus/is-obj/tree/v1.0.1}
   * @author  Zhonglei Qiu
   * @since   2.0.0
   */
  (obj: any): boolean
}

declare const instance: Interface
export = instance
