import {Cli} from './_base'

interface Interface {
/**
 * @example
 *
 * ```
 *   cli({
 *     usage: 'cli [options] <foo>',
 *     version: '1.0.0'
 *   })
 *   .options({
 *     'e | escape': '<bool> escape input string',
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
  (conf: Cli.Conf): Cli
}

declare const instance: Interface
export = instance
