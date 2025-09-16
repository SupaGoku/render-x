import type { VNode, VNodeChild } from '../types'

export interface ContextProviderProps<T> {
  value?: T
  children?: [VNodeChild]
}

export interface RenderXContext<T> {
  id: symbol
  defaultValue: T
  Provider: (props: ContextProviderProps<T>) => VNode
}
