import type { EffectHook } from '../types'
import { getHookContext } from './internal/context'
import { areDepsEqual } from './internal/deps'

export const useEffect = (effect: () => void | (() => void), deps?: readonly any[]): void => {
  const context = getHookContext()
  const hookIndex = context.index++
  const existingHook = context.hooks[hookIndex]

  if (!existingHook) {
    const effectHook: EffectHook = {
      type: 'effect',
      effect,
      deps,
      cleanup: undefined,
    }
    context.hooks[hookIndex] = effectHook
    return
  }

  if (existingHook.type !== 'effect') {
    throw new Error(`Hook type mismatch at index ${hookIndex}: expected effect, got ${existingHook.type}`)
  }

  const hasNoDeps = deps === undefined
  const hasChangedDeps = deps && !areDepsEqual(existingHook.deps, deps)

  if (hasNoDeps || hasChangedDeps) {
    if (existingHook.cleanup) {
      existingHook.cleanup()
      existingHook.cleanup = undefined
    }

    existingHook.effect = effect
    existingHook.deps = deps
  } else {
    existingHook.effect = effect
  }
}
