import type { RenderXElement, RenderXNode } from '../types'

export interface ContextProviderProps<T = unknown> {
  value?: T
  children?: RenderXElement
}

export interface RenderXContext<T> {
  id: symbol
  defaultValue: T
  Provider: (props: ContextProviderProps<T>) => RenderXNode
}
