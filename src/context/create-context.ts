import type { RenderXComponent, RenderXNode } from '../types'
import type { ContextProviderProps, RenderXContext } from './types'

export const CONTEXT_MARKER = Symbol('render-x-context')

type ProviderComponent<T> = (props: ContextProviderProps<T>) => RenderXNode

export const createContext = <T>(defaultValue: T, debugName?: string): RenderXContext<T> => {
  const id = debugName ? `${debugName}-${crypto.randomUUID()}` : crypto.randomUUID()

  const context: RenderXContext<T> = {
    id: Symbol(id),
    defaultValue,
    Provider: undefined as unknown as ProviderComponent<T>,
  }

  const Provider: ProviderComponent<T> = (props) => {
    const children = props?.children ?? []
    const childrenArray = Array.isArray(children) ? children : [children]
    if (childrenArray.length !== 1) throw new Error(`Context.Provider expects exactly one child element`)

    return childrenArray[0] as RenderXNode
  }

  Object.defineProperty(Provider, CONTEXT_MARKER, {
    value: context,
    enumerable: false,
  })

  context.Provider = Provider

  return context
}

export const getContextFromComponent = <T>(component: RenderXComponent): RenderXContext<T> | null =>
  (component as any)[CONTEXT_MARKER] as RenderXContext<T>
