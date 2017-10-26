interface Interface {
  /**
   * 对字符串中的字符进行转义
   *
   * 在用 new RegExp 创建正则表达式时很常用
   *
   * @param  {String} str 要转义的字符串
   * @return {String}     转义后的字符串
   *
   * @author    Zhongle Qiu
   * @since     2.0.0
   */
  (str: string): string

  gre: RegExp
  re: RegExp
}

declare const instance: Interface
export = instance
