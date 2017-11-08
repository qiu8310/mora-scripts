interface Interface {
  /**
   * 格式化日期
   *
   * @param  {Date}   [date]  要格式化的日期，如果不传则使用当前日期
   * @param  {String} format  格式字符串，支持如下格式（以 2014-01-02 04:05:06 为例）：
   *
   *  FORMAT  |       EXAMPLE
   *  --------|----------------
   *  yyyy    |       2014
   *  yy      |       14
   *  m, mm   |       1, 01
   *  M, MM   |       Jan, January
   *  d, dd   |       2, 02
   *  D, DD   |       Thur, Thursday
   *  Do      |       2nd（Day of month with ordinal: 1st..31st）
   *  H, HH   |       4, 04（24 hour time)
   *  h, hh   |       4, 04 (12 hour time used with `a A`)
   *  a, A    |       am, AM
   *  i, ii   |       5, 05
   *  s, ss   |       6, 06
   *  x       |       1388646306
   *  X       |       1388646306346
   *
   * @return {String}         格式化后的日期
   *
   * @example
   * ```
   * formatDate(new Date(), 'h:ii A')
   * // 8:30 AM
   * ```
   *
   * @author Zhonglei Qiu
   * @since 2.0.0
   */
  (date: Date, format: string): string

  /**
   * 格式化当前日期
   *
   * @param  {String} format  格式字符串，支持如下格式（以 2014-01-02 04:05:06 为例）：
   *
   *  FORMAT  |       EXAMPLE
   *  --------|----------------
   *  yyyy    |       2014
   *  yy      |       14
   *  m, mm   |       1, 01
   *  M, MM   |       Jan, January
   *  d, dd   |       2, 02
   *  D, DD   |       Thur, Thursday
   *  Do      |       2nd（Day of month with ordinal: 1st..31st）
   *  H, HH   |       4, 04（24 hour time)
   *  h, hh   |       4, 04 (12 hour time used with `a A`)
   *  a, A    |       am, AM
   *  i, ii   |       5, 05
   *  s, ss   |       6, 06
   *  x       |       1388646306
   *  X       |       1388646306346
   *
   * @return {String}         格式化后的日期
   *
   * @example
   * ```
   * formatDate('yyyy-mm-dd HH:ii:ss')
   * // 2016-07-08 15:03:02
   * ```
   *
   * @author Zhonglei Qiu
   * @since 2.0.0
   */
  (format: string): string
}

declare const instance: Interface
export = instance
