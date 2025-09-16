import type { VNode } from '../types'
import { beginContext, endContext } from './registry'
import type { ContextProviderProps, RenderXContext } from './types'

export const CONTEXT_MARKER = Symbol('render-x-context')

type ProviderComponent<T> = (props: ContextProviderProps<T>) => VNode

export const createContext = <T>(defaultValue: T): RenderXContext<T> => {
  const context: RenderXContext<T> = {
    id: Symbol('render-x-context-id'),
    defaultValue,
    Provider: undefined as unknown as ProviderComponent<T>,
  }

  const Provider: ProviderComponent<T> = (props) => {
    const children = props?.children ?? []

    if (Array.isArray(children)) {
      if (children.length !== 1) {
        throw new Error('Context.Provider expects exactly one child element.')
      }
      return (children[0] ?? null) as VNode
    }

    return children as VNode
  }

  Object.defineProperty(Provider, CONTEXT_MARKER, {
    value: context,
    enumerable: false,
  })

  context.Provider = Provider

  return context
}

export const getContextFromComponent = <T>(component: unknown): RenderXContext<T> | undefined => {
  if (component && typeof component === 'function') {
    return (component as any)[CONTEXT_MARKER] as RenderXContext<T> | undefined
  }

  return undefined
}

export const enterContextProvider = <T>(context: RenderXContext<T>, value: T): void => {
  beginContext(context, value)
}

export const exitContextProvider = <T>(context: RenderXContext<T>): void => {
  endContext(context)
}
