import { getHookContext } from './context'
import type { StateHook } from '../types'

export const useState = <T>(
  initialValue: T | (() => T)
): [T, (value: T | ((prev: T) => T)) => void] => {
  const context = getHookContext()
  const hookIndex = context.index++
  const existingHook = context.hooks[hookIndex]

  if (!existingHook) {
    const value =
      typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue

    const stateHook: StateHook = {
      type: 'state',
      value,
      setter: function (newValue: T | ((prev: T) => T)) {
        const nextValue =
          typeof newValue === 'function'
            ? (newValue as (prev: T) => T)(stateHook.value)
            : newValue

        if (!Object.is(stateHook.value, nextValue)) {
          stateHook.value = nextValue
          context.scheduleUpdate()
        }
      },
    }

    context.hooks[hookIndex] = stateHook
    return [stateHook.value as T, stateHook.setter]
  }

  if (existingHook.type !== 'state') {
    throw new Error(`Hook type mismatch at index ${hookIndex}: expected state, got ${existingHook.type}`)
  }

  return [existingHook.value as T, existingHook.setter]
}
