interface Interface {
  /**
   * 输出红色的字符串
   *
   * 函数参数和 util.format 一样
   *
   * @author Zhonglei Qiu
   * @since 2.0.0
   */
  (...args: any[]): void

  /**
   * 返回红色的字符串
   *
   * 函数参数和 util.format 一样
   *
   * @type {Function}
   *
   * @author Zhonglei Qiu
   * @since 2.0.0
   */
  format(...args: any[]): string
}

declare const instance: Interface
export = instance
