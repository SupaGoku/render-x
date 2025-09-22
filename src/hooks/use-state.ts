import type { StateHook } from '../types'
import { getHookContext } from './internal/context'

export const useState = <T>(initialValue: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void] => {
  const context = getHookContext()
  const hookIndex = context.index++
  const existingHook = context.hookInstance.state.hooks[hookIndex]
  const instance = context.hookInstance

  if (!existingHook) {
    const value = typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue

    const stateHook: StateHook = {
      type: 'state',
      value,
      setter: function (newValue: T | ((prev: T) => T)) {
        const currentHook = instance.state.hooks[hookIndex] as StateHook
        if (!currentHook) return

        const nextValue = typeof newValue === 'function' ? (newValue as (prev: T) => T)(currentHook.value) : newValue

        if (!Object.is(currentHook.value, nextValue)) {
          currentHook.value = nextValue
          if (instance.scheduleUpdate) {
            instance.scheduleUpdate()
          }
        }
      },
    }

    context.hookInstance.state.hooks[hookIndex] = stateHook
    return [stateHook.value as T, stateHook.setter]
  }

  if (existingHook.type !== 'state') {
    throw new Error(`Hook type mismatch at index ${hookIndex}: expected state, got ${existingHook.type}`)
  }

  return [existingHook.value as T, existingHook.setter]
}
