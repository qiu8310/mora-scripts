declare module "path" {
    export function normalize(p: string): string;
    export function join(...paths: any[]): string;
    export var sep: string;
    export default {
      a: 1,
      b: 2
    }
}
