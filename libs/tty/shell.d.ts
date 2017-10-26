import {SpawnOptions, ChildProcess} from 'child_process'

interface Interface {
  /**
   * 运行指定的命令
   *
   * @param  {String} command 要运行的命令
   * @param  {Object} [options] 配置选项，支持所有 child_process.spawn 的选项
   * @return {ChildProcess}
   *
   * @see    [spawn-command@0.0.2]{@link https://github.com/mmalecki/spawn-command/tree/v0.0.2}
   * @see    [execa@0.4.0]{@link https://github.com/sindresorhus/execa/tree/v0.4.0}
   *
   * @example
   * shell('ls some_dir')
   * shell('ps aux')
   *
   * @since 2.0.0
   * @author Zhonglei Qiu
   */
  (command: string, options?: SpawnOptions): ChildProcess

  /**
   * 运行指定命令，返回程序退出后的 code
   *
   * 默认的 options 是 {stdio: 'inherit'}
   */
  promise(command: string, options?: SpawnOptions): Promise<number>
}

declare const instance: Interface
export = instance
