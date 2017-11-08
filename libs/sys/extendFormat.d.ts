interface Interface {
  /**
   * 扩展系统的 util.format 函数，使其支持其它格式
   *
   * 默认的 util.format 只支持 %s %d %j %% 四个参数
   *
   * @param  {RegExp|Object|Array<Object>}  regexp  可以是下面三种形式：
   *   - RegExp: 一个不包含捕获数组（正则中没有括号 或者是 "(?: ... )" 这种形式）的正则表达式（正则如果有 modifiers，会忽略掉）
   *   - Object: Object 需要包含 match: RegExp 和 handle: Function，另外还可以配置 order: 优先级，expectArgNum: 处理的参数的个数
   *   - Array: 表示有多个上面的 Object
   *
   * @param  {Function}                     [fn]    当第一个参数是 RegExp 时，此参数才有意义，表示 handle 函数
   * @return {Function}                             新的 format 函数
   *
   * @example
   * ```
   *   // 1. 匹配 "%" + 数字 + "c" 形式的结构
   *   var format = extendFormat(/%\dc/, function (values, format) {
   *     return values[0].repeat(parseInt(values[0], 10)) + ' c'
   *   })
   *
   *   format('foo %2c', 'bar') // => 'foo barbar c'
   * ```
   *
   * @example
   *
   * ```
   *   // 2. 如果要继承多个，不要一个一个去调用，使用数组来批量注入
   *   var format = extendFormat([
   *     {
   *       match: /%\dd/,
   *       expectArgNum: 2,      // 期望的参数个数（默认为1），如果参数不足，则 handle 不会被调用
   *       order: 100,           // 用来决定调用 format 的顺序，默认为100，越小优先级越高
   *
   *       handle(val1, val2, format) {},
   *
   *       // 下面六个 hook 需要返回字符串，或 undefined
   *       onStart(parsedTemplateArray) {},   // 返回的字段会出现在输出的最前面
   *       onEnd(parsedTemplateArray) {},     // 返回的字段会出现在输出的最后面
   *
   *       onGroupStart(parsedTemplate, template) {},           // 在单个模板替换前调用
   *       onGroupEnd(parsedTemplate, replacedTemplate) {},     // 在单个模板替换后调用
   *
   *       onFormatStart(templateArg, parsedTemplate) {},  // 在模板的每个字段替换前调用
   *       onFormatEnd(templateArg, parsedTemplate) {}     // 在模板的每个字段替换后调用
   *     },
   *
   *     {
   *       match: /%\ds/,
   *       handle: ...
   *     }
   *   ])
   * ```
   *
   * @author Zhonglei Qiu
   * @since 2.0.0
   */
  (regexp: any, fn?: any): (...args: any[]) => string
}

declare const instance: Interface
export = instance
