interface Interface {
  __platform: string
  data: () => string
  desktop: () => string
  home: () => string
  tmp: () => string
}

declare const instance: Interface
export = instance
