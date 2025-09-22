import { getHookContext } from './internal/context'
import { areDepsEqual } from './internal/deps'
import type { MemoHook } from '../types'

export const useMemo = <T>(factory: () => T, deps?: readonly any[]): T => {
  const context = getHookContext()
  const hookIndex = context.index++
  const existingHook = context.hookInstance.state.hooks[hookIndex]

  if (!existingHook) {
    const value = factory()
    const memoHook: MemoHook<T> = {
      type: 'memo',
      value,
      deps,
    }
    context.hookInstance.state.hooks[hookIndex] = memoHook
    return value
  }

  if (existingHook.type !== 'memo') {
    throw new Error(`Hook type mismatch at index ${hookIndex}: expected memo, got ${existingHook.type}`)
  }

  if (deps === undefined || !areDepsEqual(existingHook.deps, deps)) {
    const value = factory()
    existingHook.value = value
    existingHook.deps = deps
  }

  return existingHook.value as T
}
