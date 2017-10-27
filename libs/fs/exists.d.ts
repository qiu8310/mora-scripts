import {IFileType} from './_base'

interface Interface {
/**
 *
 * 以同步的方式判断文件是否存在
 *
 * 支持指定允许的文件类型，默认只会判断 stat.isFile，
 * 通过第二个参数可以指定文件类型，可以设置成单个，
 * 或多个类型；如果指定了多个类型，则只要有一个成功
 * 就会返回 true
 *
 * @param     {String}               startFile    文件路径
 * @param     {String|Array<String>} [allowTypes]  允许的文件类型，支持下面几种：
 *   - File
 *   - Directory
 *   - BlockDevice
 *   - CharacterDevice
 *   - FIFO
 *   - Socket
 *
 * @return    {Boolean}
 *
 * @example
 *
 * ```
 *   exists('./some/path')                         // 判断是否是文件
 *   exists('./some/path', 'File')                 // 判断是否是文件
 *   exists('./some/path', 'Directory')            // 判断是否是文件夹
 *   exists('./some/path', ['File', 'Directory'])  // 判断是文件或者文件侠，返回 false/'file'/'directory'
 * ```
 *
 *
 * @author    Zhongle Qiu
 * @since     2.0.0
 *
 */
  (startFile: string, allowTypes?: IFileType | IFileType[]): boolean
/**
 * 文件是否存在
 * @param  {String} startFile 文件路径
 * @return {Boolean}
 */
  file(startFile: string): boolean
/**
 * 目录是否存在
 * @param  {String} startFile 目录路径
 * @return {Boolean}
 */
  directory(startFile: string): boolean
}

declare const instance: Interface
export = instance
