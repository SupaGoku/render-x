import type { EffectHook, HookContext, HookData } from '../../types'

export const isEffectHook = (hook: HookData | undefined): hook is EffectHook => {
  return Boolean(hook && hook.type === 'effect')
}

export const runEffects = (context: HookContext): void => {
  for (const hook of context.hooks) {
    if (isEffectHook(hook) && !hook.cleanup) {
      const cleanup = hook.effect()
      if (typeof cleanup === 'function') {
        hook.cleanup = cleanup
      }
    }
  }
}

export const cleanupEffects = (context: HookContext): void => {
  for (const hook of context.hooks) {
    if (isEffectHook(hook) && hook.cleanup) {
      hook.cleanup()
      hook.cleanup = undefined
    }
  }
}
