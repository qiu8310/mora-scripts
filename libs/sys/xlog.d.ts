interface Interface {
  /**
   * 输出带样式的字符串，拥有 {@link module:libs/sys/clog} 的所有功能
   *
   * FORMAT  |  EXPLAIN
   * --------|-----------
   * %d      |  格式化成整数，使用了 parseInt
   * %\d*f   |  格式化成浮点数，使用了 parseFloat，中间的数字表示保存的小数位数
   * %j, %o  |  格式化成对象，使用了原生的 util.format('%j', val)
   * %c      |  格式化成颜色，使用了 {@link module:libs/sys/clog.format}
   * %...s   |  格式化字符串，支持对齐，参数复杂，用 ... 表示省略，说情参看 {@link module:libs/sys/xlog.align}
   *
   * @param {String} template   模板
   * @param {...*}   [arg]      模板的参数
   * @param {String} [template] 第二个模板，后面可以继续接 ...arg, template, ...arg, ...
   *
   * @example
   * xlog('price %2f$', 100)  => 'price 100.00$'
   *
   * xlog('%5:<.>s', 'a')     => '<<a>>'
   * xlog('%5:<.>s', 'abc')   => '<abc>'
   *
   * @method
   * @author Zhonglei Qiu
   * @since  2.0.0
   */
  (...args: any[]): void

  /**
   * 使用的 format 函数，类似于 console.log 使用了 util.format 函数
   *
   * @method
   * @return {String}  格式化后的字符串
   */
  format(...args: any[]): string

  /**
   * 对齐 str 字符串
   *
   * @type   {Function}
   * @param  {String} str    要对齐的字符串
   * @param  {String} format 对齐规则，规则如下
   *
   *  EXAMPLE    |    EXPLAIN
   *  -----------|----------------
   *  3          |  至少有3个字符，没有的话在左边补【默认字符】
   *  .3         |  至少有3个字符，没有的话在右边补【默认字符】
   *  1.2        |  至少3个字符，不足的话左右两边填充【默认字符】，先填左，再填右，再填右
   *  1.2:_      |  至少3个字符，没有的话在左边补 _，在右边补【默认字符】
   *  1.2:.0     |  至少3个字符，没有的话在左边补【默认字符】，在右边补 0
   *  1.2:_.0    |  至少3个字符，没有的话在左边补 _，在右边补 0
   *
   * @param  {Object} opts   配置选项
   *    -  {String} [opts.leftPad=" "]    左侧填充的【默认字符】
   *    -  {String} [opts.rightPad=" "]   右侧填充的【默认字符】
   *
   * @return {String}        对齐后的 str
   */
  align(str: string, format: string, opts?: {leftPad?: string, rightPad?: string}): string
}

declare const instance: Interface
export = instance
