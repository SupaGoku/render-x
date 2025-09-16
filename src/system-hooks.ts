interface StateHook {
  type: 'state'
  value: any
  setter: (value: any) => void
}

interface EffectHook {
  type: 'effect'
  effect: () => void | (() => void)
  deps?: any[]
  cleanup?: () => void
}

interface RefHook {
  type: 'ref'
  current: any
}

export type HookData = StateHook | EffectHook | RefHook

export interface HookContext {
  index: number
  hooks: HookData[]
  component: any
  scheduleUpdate: () => void
}

let currentContext: HookContext | null = null

export const setHookContext = (context: HookContext | null): void => {
  currentContext = context
}

export const getHookContext = (): HookContext => {
  if (!currentContext) {
    throw new Error('Hook called outside of component context')
  }
  return currentContext
}

export const useState = <T>(initialValue: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void] => {
  const context = getHookContext()
  const hookIndex = context.index++

  const existingHook = context.hooks[hookIndex]

  if (!existingHook) {
    const value = typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue

    const stateHook: StateHook = {
      type: 'state',
      value,
      setter: function (newValue: T | ((prev: T) => T)) {
        const nextValue = typeof newValue === 'function' ? (newValue as (prev: T) => T)(stateHook.value) : newValue
        if (!Object.is(stateHook.value, nextValue)) {
          stateHook.value = nextValue
          context.scheduleUpdate()
        }
      },
    }

    context.hooks[hookIndex] = stateHook
    return [stateHook.value, stateHook.setter]
  }

  if (existingHook.type !== 'state') {
    throw new Error(`Hook type mismatch at index ${hookIndex}: expected state, got ${existingHook.type}`)
  }

  return [existingHook.value, existingHook.setter]
}

export const useEffect = (effect: () => void | (() => void), deps?: any[]): void => {
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

  const hasNoDeps = !deps
  const hasChangedDeps = deps && !areDepsEqual(existingHook.deps, deps)

  if (hasNoDeps || hasChangedDeps) {
    if (existingHook.cleanup) {
      existingHook.cleanup()
      existingHook.cleanup = undefined
    }

    existingHook.effect = effect
    existingHook.deps = deps
  }
}

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

const areDepsEqual = (a: any[] | undefined, b: any[] | undefined): boolean => {
  if (a === b) return true
  if (!a || !b) return false
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (!Object.is(a[i], b[i])) return false
  }
  return true
}

export const runEffects = (context: HookContext): void => {
  for (const hook of context.hooks) {
    if (hook && hook.type === 'effect' && !hook.cleanup) {
      const cleanup = hook.effect()
      if (typeof cleanup === 'function') {
        hook.cleanup = cleanup
      }
    }
  }
}

export const cleanupEffects = (context: HookContext): void => {
  for (const hook of context.hooks) {
    if (hook && hook.type === 'effect' && hook.cleanup) {
      hook.cleanup()
      hook.cleanup = undefined
    }
  }
}
