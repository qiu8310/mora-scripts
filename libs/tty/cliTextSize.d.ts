interface Interface {
  /**
   * 计算 Unicode 字符串在终端上的长度
   *
   * @param  {String} str 将会显示在终端上的字符串
   * @return {Number}
   *
   * @example
   * cliTextSize('中国')  // => 4
   * cliTextSize('ab')    // => 2
   *
   * @see    [tty-text-size@1.0.0]{@link https://github.com/qiu8310/tty-text-size/tree/1.0.0}
   * @throws {Error} 当包含 \t, \r, \v, \f, \n 这些无法计算长度的字符时
   *
   * @since 2.0.0
   * @author Zhonglei Qiu
   */
  (str: string): number
}

declare const instance: Interface
export = instance
