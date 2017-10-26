interface Interface {
  /**
   * 获取 obj 对象的原生的 toString 的结果
   *
   * @param   {*}      obj   任何的 JS 类型
   * @return  {String}
   *
   * @author  Zhonglei Qiu
   * @since   2.0.0
   */
  (obj: any): string
}

declare const instance: Interface
export = instance
