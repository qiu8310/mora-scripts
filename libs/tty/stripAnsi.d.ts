interface Interface {
  /**
   * 去掉字符串中的 ansi escape 字符
   *
   * @param  {*} str      需要去除 ansi escape code 的字符串，如果 str 不是字符串，则返回它本身
   * @return {String}     去除 ansi escape code 之后的字符串
   *
   * @see [ansi escape code from wiki]{@link https://en.wikipedia.org/wiki/ANSI_escape_code}
   * @see [strip-ansi@3.0.1]{@link https://github.com/chalk/strip-ansi/tree/v3.0.1}
   *
   * @example
   * stripAnsi('\u001b[31ma\u001b[0m') // 'a'
   *
   * @author Zhonglei Qiu
   * @since 2.0.0
   */
  (str: string): string

  /**
   * 匹配 ansi code 的 global 正则
   */
  gre: RegExp
}

declare const instance: Interface
export = instance
