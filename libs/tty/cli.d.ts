import {Cli} from './_base'

interface Interface {
  /**
   * @example
   *
   *    cli({
   *      usage: 'cli [options] <foo>'
   *      version: '1.0.0'
   *    })
   *    .options({
   *      'e | escape': '<bool> escape input string'
   *    })
   *    .parse(function (res) {
   *      if (res.escape) {
   *        // ...
   *      }
   *    })
   *
   *
   * @see    optimist, minimist, yargs, nomnom, nopt, commander
   */
  (conf: Cli.Conf): Cli
}

declare const instance: Interface
export = instance
