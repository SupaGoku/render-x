import type { HookContext } from '../../types'
import { setHookContext } from './context'
import { runEffects } from './effect-utils'
import { rerenderWithHooks } from './render'
import { HookInstance } from './types'

interface UpdateQueueState {
  updateQueue: Set<HookInstance>
  isFlushScheduled: boolean
}

const state: UpdateQueueState = {
  updateQueue: new Set(),
  isFlushScheduled: false,
}

export const scheduleUpdate = (instance: HookInstance): void => {
  state.updateQueue.add(instance)

  if (state.isFlushScheduled) return

  state.isFlushScheduled = true
  queueMicrotask(() => flushUpdates())
}

export const deleteUpdateQueue = (instance: HookInstance): boolean => state.updateQueue.delete(instance)

export const clearUpdateQueue = (): void => state.updateQueue.clear()

const flushUpdates = (): void => {
  state.isFlushScheduled = false
  const updates = Array.from(state.updateQueue)
  state.updateQueue.clear()

  for (const instance of updates) {
    if (!instance.mounted || instance.unmounted) continue

    const context: HookContext = {
      index: 0,
      hooks: instance.state.hooks,
      component: instance,
      scheduleUpdate: instance.scheduleUpdate,
    }

    setHookContext(context)

    try {
      const newVNode = instance.component(instance.props)
      instance.vnode = newVNode

      if (instance.container) rerenderWithHooks(instance.container, newVNode)
    } finally {
      setHookContext(null)
    }

    instance.state.renderCount++

    requestAnimationFrame(() => {
      if (!instance.unmounted) {
        runEffects(context)
      }
    })
  }
}
