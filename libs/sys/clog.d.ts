interface Interface {
  /**
   * 是否在 format 的最后加上 ANSI 的 RESET 控制字符
   *
   * @default true
   * @type {Boolean}
   */
  autoResetAtEnd: boolean

  /**
   * 是否在每一个模板结尾加上 ANSI 的 RESET 控制字符（默认为 true）
   *
   * 这里解释一下，拿语句 `console.log('Are %s ok', 'you', 'I %s %s', 'am', 'ok')` 来说，
   * 句子中共有两个 group（把每一个模板和它的参数叫做一个 group）：
   *   - group 1 => 模板：'Are %s ok'， 参数：'you'
   *   - group 2 => 模板：'I %s %s'，   参数：'am', 'ok'
   *
   * 所以，如果 autoResetAtGroupEnd 是 true，则在上面每个 group 之后都会加上 reset 控制串
   *
   * @default true
   * @type {Boolean}
   */
  autoResetAtGroupEnd: boolean

  /**
   * 输出带颜色的格式化字符串
   *
   * 函数参数和 util.format 类似，只是 util.format 支持 %s %d %j %% 四个格式，
   * 此函数多支持一个 %c 的格式，用来指定后面文字的颜色
   *
   *
   * 支持的颜色字符有（所有 CODE 大小写都不敏感）：
   *
   * CODE                     |  EXPLAIN
   * -------------------------|---------------
   * reset, end               |  重置所有色值
   * h, high, l, low          |  标记颜色的明亮度，只针对 8 种基本颜色有效 {@link https://en.wikipedia.org/wiki/ANSI_escape_code#Colors}
   * fg, foreground, c, color |  标记为前景色模式
   * bg, background           |  标记为背景色模式
   * default                  |  恢复默认的前景色或背景色
   * black, red, green, yellow, blue, magenta, cyan, white  | 8 种基本颜色（不带标记默认为前景色）
   * bgBlack, backgroundBlack, bgRed, backgroundReg, ...    | 8 种基本的背景色
   * bold, faint, gray, dim, italic, underline, reverse     | 一些 modifiers
   * rBold, resetBold, rFaint, resetFaint, ...              | 重置 modifiers
   * brown, chocolate, ghostwhite, gold, navy, ...          | 默认的一些颜色，参见 {@link module:libs/sys/clog.NAMED_COLORS}
   * F00, FF0000, #F00, #FF0000 ...                         | 十六进制颜色，支持三位，或六位，支持不带 "#"
   *
   * @example
   * ```
   * // 下面两个输出的 "you" 是红字黄底，其它文字都是默认的颜色
   * clog('Are %cyou%c ok', 'fg.red.bg.yellow', 'reset')
   * clog('Are %s ok', clog.format('%cyou', 'red.bgYellow'))
   * ```
   *
   * @param {String}  template         模板字符串，里面可以包含 %s, %d, %j, %c, %% 这些特殊格式
   * @param {...*}    [arg]            给模板用的参数
   * @param {String}  [template2]      第二个模板，后面可以继续接 ...arg, template, ...arg, ...
   * @return {String} 格式化后的字符串
   *
   * @method
   * @author Zhonglei Qiu
   * @since 2.0.0
   */
  (...args: any[]): void

  /**
   * {@link module:libs/sys/clog} 使用的 format 函数，类似于 console.log 使用了 util.format 函数
   * @type {Function}
   */
  format(...args: any[]): string

  NAMED_COLORS: {
    brown: string
    chocolate: string
    ghostwhite: string
    gold: string
    navy: string
    olive: string
    orange: string
    orangered: string
    pink: string
    purple: string
    seagreen: string
    silver: string
    skyblue: string
    yellowgreen: string
  },
  colorMatcher: {
    match: RegExp
    handle: (color: string) => string
    onEnd: () => string
    onGroupEnd: () => string
    onFormatEnd: (arg: any) => string
  }
}

declare const instance: Interface
export = instance
