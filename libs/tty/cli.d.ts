// import {Cli} from './_base'

declare var cli: cli
export = cli
export as namespace cli

declare namespace cli {
  interface Conf {
    /**
     * 指定命令行的用法
     *
     * @example
     * cli [options] <foo>
     */
    usage?: string | (() => string)
    /**
     * 命令行的描述
     */
    desc?: string | string[] | (() => string)
    /**
     * 命令行的使用示例
     */
    example?: string | string[] | (() => string)
    /**
     * 放在 help 末尾的信息，一般可以放一些版权之类的说明
     */
    epilog?: string | (() => string)
    /**
     * 指定版本号， 如 1.0.0
     *
     * 如果设置为 false，就不会自动加上 "v | version" 选项
     */
    version?: false | string | (() => string)
    /**
     * 禁用自动添加的 "h | help" 选项
     */
    help?: false
    /**
     * 在遇到第一个非 option 参数时就停止解析（很适用于子程序）
     */
    stopParseOnFirstNoOption?: boolean
    /**
     * 出错时显示帮助信息
     */
    showHelpOnError?: boolean
    /**
     * 严格模式，遇到无法解析的 option 是就报错
     */
    strict?: boolean
  }
  interface Response {
    /**
     * 原始的未处理过的 args，默认是 process.argv.slice(2)
     */
    rawArgs: string[]

    /**
     * 记录所有用户自定义的选项
     */
    userDefined: {[key: string]: boolean}

    /** 子命令名称，由于子命令支持通配符，所以需要通过此字段来获取子命令实际的值 */
    $command: string

    /**
     * 解析完后剩下的给程序的参数
     */
    _: string[]
    /**
     * 其它 options 中指定的键值，如果没设置也会存在，且值为 undefined
     */
    [optionKey: string]: any
  }
  type OptionType = 'boolean' | 'string' | 'number' | 'array' | 'count'
  type Options = {
    [key: string]: string | {
        type: OptionType
        desc?: string
        defaultValue?: any
    }
  }
  type Commands = {
    [key: string]: ((this: Cli, res: Response, cli: Cli) => void) | {
        desc?: string
        conf?: Conf
        options?: Options
        groups?: {[optionGroupName: string]: Options}
        cmd: ((this: Cli, res: Response, cli: Cli) => void)
    }
  }

  type Constructor = Cli
}

interface cli {
  /**
   * @example
   *
   * ```
   *   cli({
   *     usage: 'cli [options] <foo>',
   *     version: '1.0.0'
   *   })
   *   .options({
   *     'e | escape': '<bool> escape input string ',
   *     'm | modules': '<array> 指定模块，需要 -m mod1 -m mod2 这样用',
   *     'o | other': {
   *          type: 'string',
   *          desc: 'xxxxxxxxx',
   *          defaultValue: '...'
   *      }
   *   })
   *   .parse(function (res) {
   *     if (res.escape) {
   *       // ...
   *     }
   *   })
   * ```
   *
   * @see    optimist, minimist, yargs, nomnom, nopt, commander
   */
  (conf: cli.Conf): Cli
}

/**
 * @example
 *
 * ```
 *   cli({
 *     usage: 'cli [options] <foo>',
 *     version: '1.0.0'
 *   })
 *   .options({
 *     'e | escape': '<bool> escape input string {{ defaultValue }}',
 *     'm | modules': '<array> 指定模块，需要 -m mod1 -m mod2 这样用',
 *     'o | other': {
 *          type: 'string',
 *          desc: 'xxxxxxxxx',
 *          defaultValue: '...'
 *      }
 *   })
 *   .parse(function (res) {
 *     if (res.escape) {
 *       // ...
 *     }
 *   })
 * ```
 * @see    optimist, minimist, yargs, nomnom, nopt, commander
 */
declare class Cli {
  conf: cli.Conf
  /**
   * 解析完后剩下的给程序的参数
   */
  _: string[]
  constructor(conf: cli.Conf)
  /**
   * 设置 Cli 程序支持的选项
   *
   * @param  {String} [group]     选项可以分组，此值可以指定分组的名称，在选项非常多的情况下，
   *                              使用 --help 时可以看到效果
   *
   * @param  {Object} opts        此分组下的所有选项
   *
   * opts 是 key-value 对象，支持下面几种类型的配置
   *   - str1:str2... => <type> desc
   *   - str1:str2... => {type: '', desc: '', defaultValue: ''}
   *
   * 说明：
   *   1. str1 是一个 option，":" 后面的 str2 等等表示 str1 的别名
   *   2. desc 表示 option 的描述
   *   3. type 表示 option 的类型，支持的类型有
   *     * boolean   bool
   *     * string    str   不能为空
   *     * number    num   不能为空
   *     * array     arr   可以为空
   *     * count
   *
   * @return {Cli}
   *
   * @example
   * ```
   *   cli.options({
   *     'e | escape': '<boolean> enable escape',
   *     'l | linefeed': {
   *       type: 'boolean',
   *       desc: 'append a system linefeed at end'
   *     }
   *   })
   * ```
   *
   */
  options(groupName: string, opts: cli.Options): Cli

  /**
   * 设置 Cli 程序支持的选项
   *
   * @param  {Object} opts        默认分组下的所有选项
   *
   * opts 是 key-value 对象，支持下面几种类型的配置
   *   - str1:str2... => <type> desc
   *   - str1:str2... => {type: '', desc: '', defaultValue: ''}
   *
   * 说明：
   *   1. str1 是一个 option，":" 后面的 str2 等等表示 str1 的别名
   *   2. desc 表示 option 的描述
   *   3. type 表示 option 的类型，支持的类型有
   *     * boolean   bool
   *     * string    str   不能为空
   *     * number    num   不能为空
   *     * array     arr   可以为空
   *     * count
   *
   * @return {Cli}
   *
   * @example
   *
   * ```
   *   cli.options({
   *     'e | escape': '<boolean> enable escape',
   *     'l | linefeed': {
   *       type: 'boolean',
   *       desc: 'append a system linefeed at end'
   *     }
   *   })
   * ```
   *
   */
  options(opts: cli.Options): Cli

  /**
   * 设置 Cli 程序的子命令
   *
   * @param  {Object} commands 子命令配置
   *
   *   opts 是 key-value 对象，支持下面几种类型的配置
   *   - str1:str2... => function
   *   - str1:str2... => {desc: '', cmd: function}
   *
   * @return {Cli}
   *
   * @example
   *
   * ```
   *   cli.commands({
   *     'r | run': function (res) {
   *       // handle
   *     },
   *     second: {
   *       desc: 'this is sub-command with description',
   *       cmd: function (res) {
   *         // handle
   *       }
   *     },
   *     thrid: {
   *       conf: {},
   *       options: {},
   *       groups: {},
   *       cmd: function (res) {
   *
   *       }
   *     }
   *   })
   * ```
   *
   */
  commands(commands: cli.Commands): Cli

  /**
   * 解析传入的参数
   *
   * - 解析到 "--" 就停止解析
   * - array 类型的参数支持重复设置，其它类型的参数会被覆盖，array 形式的 option 如果不加参数会返回空数组
   * - 支持短标签加数字的快捷方式，如 "-n100"，前提是 "-n" 需要是 number 类型
   * - 其它：https://github.com/yargs/yargs#parsing-tricks
   *
   * @param {Array<String>} [args]  参数
   * @param {Function}      handle  parse 完成后，如果没有被内部 handle，则会调用此 handle
   * @return {Cli}
   *
   * @example
   *
   * ```
   *   cli.parse(process.argv.slice(2), function (res) {
   *     if (res.foo) {
   *       // do something
   *     }
   *   })
   * ```
   *
   */
  parse(args: string[], handle: (this: Cli, res: cli.Response, cli: Cli) => void): void

  /**
   * 解析传入的参数
   *
   * - 解析到 "--" 就停止解析
   * - array 类型的参数支持重复设置，其它类型的参数会被覆盖，array 形式的 option 如果不加参数会返回空数组
   * - 支持短标签加数字的快捷方式，如 "-n100"，前提是 "-n" 需要是 number 类型
   * - 其它：https://github.com/yargs/yargs#parsing-tricks
   *
   * @param {Function}      handle  parse 完成后，如果没有被内部 handle，则会调用此 handle
   * @return {Cli}
   *
   * @example
   *
   * ```
   *   cli.parse(function (res) {
   *     if (res.foo) {
   *       // do something
   *     }
   *   })
   * ```
   *
   */
  parse(handle?: (this: Cli, res: cli.Response, cli: Cli) => void): void

  error(...args: string[]): void
  help(returnStr?: boolean): string | void
}
