interface Interface {

  /**
   * 将一个二维的字符串数组，转化成一个 table 格式的字符串，方便在终端上显示，主要特点有：
   *
   * 1. 精确计算字符的宽度，自动换行：很多老外写的类似的库都采用 str.length 来得到字符串在终端上的显示长度，
   *    但是，中文在终端上一般占用两个字符，而且不同系统上字符长度也会不一样
   * 2. 自动重置颜色：当一个 cell 中有颜色时，如果不重置色值，它是会影响后面 cell 的
   * 3. 判断是否超出屏幕大小：如果超出，自动截断最宽的一行
   *
   * @param  {Array<Array<String>>} rows  table 中每个 cell 中的字符串，是个二维的字符串数组
   * @return {String}               table 化的字符串
   *
   * @example
   *
   * ```
   *   table([
   *     ['a', 'b', 'c'],
   *     ['d', 'ee', 'f']
   *   ])
   *
   *   // ab c
   *   // deef
   * ```
   *
   * @see [tty-wrap@0.1.0]{@link https://github.com/qiu8310/tty-wrap/tree/0.1.0}
   * @since  2.0.0
   * @author Zhonglei Qiu
   */
  (rows: Array<string[]>): string
}

declare const instance: Interface
export = instance
