import {ICliConf, Cli} from './_base'
interface Interface {
  (conf: ICliConf): Cli
}

declare const instance: Interface
export = instance
