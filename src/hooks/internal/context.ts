import type { HookContext } from '../../types'

let currentContext: HookContext | null = null

export const setHookContext = (context: HookContext | null): void => {
  currentContext = context
}

export const getHookContext = (): HookContext => {
  if (!currentContext) throw new Error('Hook called outside of component context')

  return currentContext
}
