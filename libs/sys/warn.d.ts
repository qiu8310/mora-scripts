interface Interface {
  /**
   * 输出黄色的字符串
   *
   * 函数参数和 util.format 一样
   *
   * @author Zhonglei Qiu
   * @since 2.0.0
   */
  (...args: string[]): void

  /**
   * 返回黄色的字符串
   *
   * 函数参数和 util.format 一样
   *
   * @type {Function}
   *
   * @author Zhonglei Qiu
   * @since 2.0.0
   */
  format(...args: string[]): string
}

declare const instance: Interface
export = instance
