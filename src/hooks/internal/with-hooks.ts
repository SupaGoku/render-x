import type { HookContext, VNode } from '../../types'
import { setHookContext } from './context'
import { cleanupEffects, runEffects } from './effect-utils'
import { HookInstance } from './types'
import { deleteUpdateQueue, scheduleUpdate } from './update-queue'

const instanceMap = new WeakMap<Element, HookInstance>()

export const withHooks = (component: (props: any) => VNode, props: any): VNode => {
  const instance: HookInstance = {
    component,
    props,
    state: {
      hooks: [],
      renderCount: 0,
    },
    mounted: false,
    unmounted: false,
    scheduleUpdate: () => scheduleUpdate(instance),
  }

  const context: HookContext = {
    index: 0,
    hooks: instance.state.hooks,
    component: instance,
    scheduleUpdate: instance.scheduleUpdate,
  }

  setHookContext(context)

  let vnode: VNode
  try {
    vnode = component(props)
    instance.vnode = vnode
  } finally {
    setHookContext(null)
  }

  instance.state.renderCount++

  requestAnimationFrame(() => {
    if (!instance.unmounted) {
      runEffects(context)
      instance.mounted = true
    }
  })

  const originalVNode = vnode as any
  if (originalVNode && typeof originalVNode === 'object') {
    originalVNode.__hookHost = instance
  }

  return vnode
}

export const cleanupHostInstance = (element: Element): void => {
  const instance = instanceMap.get(element)
  if (instance) {
    instance.unmounted = true
    deleteUpdateQueue(instance)

    const context: HookContext = {
      index: 0,
      hooks: instance.state.hooks,
      component: instance,
      scheduleUpdate: instance.scheduleUpdate,
    }
    cleanupEffects(context)
    instanceMap.delete(element)
  }

  const children = element.querySelectorAll('*')
  for (let i = 0; i < children.length; i++) {
    cleanupHostInstance(children[i])
  }
}
