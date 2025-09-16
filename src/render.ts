import { isVNode } from './vdom'
import type { VNode, VNodeChild, VNodeProps } from './types'

import { cleanupEvents, registerEventHandler, setupEventDelegation } from './event-manager'
import { cleanupHostInstance } from './hook-host'

export const render = (root: Element, vnode: VNodeChild): void => {
  if (!root) throw new Error('Render root element is required')
  cleanupElement(root)

  const element = createElementFromVNode(vnode)

  if (!element) throw new Error('Render element is required')

  root.appendChild(element)
  setupEventDelegation(root)
}

const createElementFromVNode = (vnode: VNodeChild): Element | Text | DocumentFragment | null => {
  if (vnode == null) return null

  if (typeof vnode === 'string' || typeof vnode === 'number') return document.createTextNode(String(vnode))

  if (!isVNode(vnode)) return null

  if (vnode.type === 'fragment') return createFragment(vnode)
  if (typeof vnode.type === 'function') return createFunctionElement(vnode)

  return createElement(vnode)
}

const createFragment = (vnode: VNode): DocumentFragment => {
  const fragment = document.createDocumentFragment()

  for (const child of vnode.children) {
    const childElement = createElementFromVNode(child)
    if (childElement) fragment.appendChild(childElement)
  }

  return fragment
}

const createFunctionElement = (vnode: VNode): Element | Text | DocumentFragment | null => {
  try {
    const result = (vnode.type as any)(vnode.props)

    return createElementFromVNode(result)
  } catch (error) {
    console.error('Functional component render error:', error)

    throw error
  }
}

const createElement = (vnode: VNode): Element => {
  const element = document.createElement(vnode.type as string)

  if (vnode.props) setElementProps(element, vnode.props)
  for (const child of vnode.children) {
    const childElement = createElementFromVNode(child)
    if (childElement) element.appendChild(childElement)
  }

  return element
}

const setElementProps = (element: Element, props: VNodeProps): void => {
  const entries = Object.entries(props ?? {}) as [string, unknown][]

  for (const [key, value] of entries) {
    if (value == null) continue

    if (key.startsWith('on') && typeof value === 'function') {
      registerEventHandler(element, key, value as (event: Event) => void)
    } else if (key === 'className') {
      element.className = String(value ?? '')
    } else if (key === 'style') {
      setElementStyle(element as HTMLElement, value)
    } else if (key.startsWith('data-') || key === 'id') {
      element.setAttribute(key, String(value))
    } else {
      ;(element as unknown as Record<string, unknown>)[key] = value
    }
  }
}

const setElementStyle = (element: HTMLElement, style: unknown): void => {
  if (typeof style === 'string') {
    element.style.cssText = style
  } else if (style && typeof style === 'object') {
    Object.assign(element.style, style as Partial<CSSStyleDeclaration>)
  }
}

const cleanupElement = (element: Element): void => {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT, null)
  let node: Element | null = walker.currentNode as Element

  while (node) {
    cleanupHostInstance(node)
    const component = (node as any).__component
    if (component && typeof component.unmount === 'function') component.unmount()
    node = walker.nextNode() as Element
  }
  cleanupEvents(element)
  element.innerHTML = ''
}
