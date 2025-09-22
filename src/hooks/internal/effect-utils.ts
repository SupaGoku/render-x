import type { EffectHook, HookContext, HookData, RenderXNode } from '../../types'

export const isEffectHook = (hook: HookData | undefined): hook is EffectHook => {
  return Boolean(hook && hook.type === 'effect')
}

export const hasEffectsToRun = (node: RenderXNode): boolean => {
  return node.hookInstance.state.hooks.some(hook => isEffectHook(hook) && hook.shouldRun)
}

export const runEffects = (node: RenderXNode): void => {
  for (const hook of node.hookInstance.state.hooks) {
    if (isEffectHook(hook) && hook.shouldRun) {
      try {
        if (hook.cleanup) {
          hook.cleanup()
          hook.cleanup = undefined
        }
        const cleanup = hook.effect()
        if (typeof cleanup === 'function') {
          hook.cleanup = cleanup
        }
        hook.shouldRun = false
      } catch (error) {
        // TODO: Figure this shit out later
        // console.error('[useEffect] Effect error in component', elementName)
        console.error(error)
        node.hookInstance.unmounted = true
        node.hookInstance.mounted = false
        throw error
      }
    }
  }
}

export const cleanupEffects = (context: HookContext): void => {
  for (const hook of context.hookInstance.state.hooks) {
    if (isEffectHook(hook) && hook.cleanup) {
      hook.cleanup()
      hook.cleanup = undefined
    }
  }
}
