import { getHookContext } from './context'
import type { RefHook } from '../types'

export const useRef = <T>(initialValue: T): { current: T } => {
  const context = getHookContext()
  const hookIndex = context.index++
  const existingHook = context.hooks[hookIndex]

  if (!existingHook) {
    const refHook: RefHook = {
      type: 'ref',
      current: initialValue,
    }
    context.hooks[hookIndex] = refHook
    return refHook as { current: T }
  }

  if (existingHook.type !== 'ref') {
    throw new Error(`Hook type mismatch at index ${hookIndex}: expected ref, got ${existingHook.type}`)
  }

  return existingHook as { current: T }
}
