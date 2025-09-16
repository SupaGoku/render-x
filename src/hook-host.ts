import {
  cleanupEffects,
  runEffects,
  setHookContext,
  type HookContext,
  type HookData,
} from './system-hooks'
import { updateElementProps } from './dom-props'
import type { VNode } from './types'

interface HookHostState {
  hooks: HookData[]
  renderCount: number
}

interface HookHostInstance {
  component: (props: any) => VNode
  props: any
  state: HookHostState
  mounted: boolean
  unmounted: boolean
  container?: Element
  vnode?: VNode
  scheduleUpdate: () => void
}

const instanceMap = new WeakMap<Element, HookHostInstance>()
const updateQueue = new Set<HookHostInstance>()
let isFlushScheduled = false

export const HookHost = (component: (props: any) => VNode, props: any): VNode => {
  const instance: HookHostInstance = {
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

const scheduleUpdate = (instance: HookHostInstance): void => {
  updateQueue.add(instance)

  if (!isFlushScheduled) {
    isFlushScheduled = true
    queueMicrotask(() => {
      flushUpdates()
    })
  }
}

const flushUpdates = (): void => {
  isFlushScheduled = false
  const updates = Array.from(updateQueue)
  updateQueue.clear()

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

      if (instance.container) {
        rerender(instance.container, newVNode)
      }
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

const rerender = (container: Element, vnode: VNode): void => {
  if (!container.parentElement) return

  updateElement(container, vnode)
}

const updateElement = (element: Element, vnode: any): void => {
  if (!vnode || !element) return

  if (typeof vnode === 'string' || typeof vnode === 'number') {
    if (element.textContent !== String(vnode)) {
      element.textContent = String(vnode)
    }
    return
  }

  if (vnode && typeof vnode === 'object' && 'type' in vnode) {
    if (vnode.props) {
      updateElementProps(element, vnode.props)
    }

    if (vnode.children) {
      updateElementChildren(element, vnode.children)
    }
  }
}

const updateElementChildren = (parent: Element, newChildren: any[]): void => {
  const existingChildren = Array.from(parent.childNodes)
  const maxLength = Math.max(existingChildren.length, newChildren.length)

  for (let i = 0; i < maxLength; i++) {
    const existingChild = existingChildren[i]
    const newChild = newChildren[i]

    if (!existingChild && newChild != null) {
      const newElement = createElementFromVNode(newChild)
      if (newElement) {
        parent.appendChild(newElement)
      }
    } else if (existingChild && newChild == null) {
      existingChild.remove()
    } else if (existingChild && newChild != null) {
      if (existingChild.nodeType === Node.TEXT_NODE) {
        const newText = typeof newChild === 'string' || typeof newChild === 'number' ? String(newChild) : ''
        if (existingChild.textContent !== newText) {
          existingChild.textContent = newText
        }
      } else if (existingChild.nodeType === Node.ELEMENT_NODE) {
        updateElement(existingChild as Element, newChild)
      }
    }
  }
}

const createElementFromVNode = (vnode: any): Element | Text | null => {
  if (vnode == null) return null
  if (typeof vnode === 'string' || typeof vnode === 'number') {
    return document.createTextNode(String(vnode))
  }

  if (vnode && typeof vnode === 'object' && 'type' in vnode) {
    if (typeof vnode.type === 'function') {
      const result = vnode.type(vnode.props)
      return createElementFromVNode(result)
    }

    const element = document.createElement(vnode.type)

    if (vnode.props) {
      for (const [key, value] of Object.entries(vnode.props)) {
        if (key.startsWith('on') && typeof value === 'function') {
          const eventName = key.slice(2).toLowerCase()
          element.addEventListener(eventName, value as EventListener)
        } else if (key === 'className') {
          element.className = (value as string) || ''
        } else if (key === 'style') {
          if (typeof value === 'string') {
            ;(element as HTMLElement).style.cssText = value
          } else if (value && typeof value === 'object') {
            Object.assign((element as HTMLElement).style, value)
          }
        } else if (key.startsWith('data-') || key === 'id') {
          element.setAttribute(key, String(value))
        } else {
          ;(element as any)[key] = value
        }
      }
    }

    if (vnode.children) {
      for (const child of vnode.children) {
        const childElement = createElementFromVNode(child)
        if (childElement) {
          element.appendChild(childElement)
        }
      }
    }

    if (vnode.__hookHost) {
      vnode.__hookHost.container = element
      instanceMap.set(element, vnode.__hookHost)
    }

    return element
  }

  return null
}

export const cleanupHostInstance = (element: Element): void => {
  const instance = instanceMap.get(element)
  if (instance) {
    instance.unmounted = true
    updateQueue.delete(instance)

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
