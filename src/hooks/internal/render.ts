import { updateElementProps } from '../../dom-props'
import { enterContextProvider, exitContextProvider, getContextFromComponent } from '../../context/internal'
import type { VNode } from '../../types'
import { HookInstance } from './types'

const instanceMap = new WeakMap<Element, HookInstance>()

export const rerenderWithHooks = (container: Element, vnode: VNode): void => {
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
      const context = getContextFromComponent(vnode.type)
      if (context) {
        const rawValue = vnode.props ? (vnode.props as any).value : undefined
        const providerValue = rawValue === undefined ? context.defaultValue : (rawValue as typeof context.defaultValue)
        enterContextProvider(context, providerValue)
      }

      try {
        const result = vnode.type(vnode.props)
        return createElementFromVNode(result)
      } finally {
        if (context) {
          exitContextProvider(context)
        }
      }
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
