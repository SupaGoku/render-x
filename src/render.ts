import type { VNode, VNodeChild } from './types'
import { isVNode } from './vdom'

import { applyElementProps } from './dom-props'
import { cleanupEvents, setupEventDelegation } from './event-manager'
import { cleanupHostInstance } from './hooks/internal'
import { enterContextProvider, exitContextProvider, getContextFromComponent } from './context/internal'

export const render = (root: Element, vnode: VNodeChild): void => {
  if (!root) throw new Error('Render root element is required')
  cleanupElement(root)

  const element = createElementFromVNode(vnode)

  if (!element) return null

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
  const context = getContextFromComponent(vnode.type as any)
  if (context) {
    const rawValue = vnode.props ? (vnode.props as any).value : undefined
    const providerValue = rawValue === undefined ? context.defaultValue : (rawValue as typeof context.defaultValue)
    enterContextProvider(context, providerValue)
  }

  try {
    const result = (vnode.type as any)(vnode.props)
    const rendered = createElementFromVNode(result)
    return rendered
  } catch (error) {
    console.error('Functional component render error:', error)

    throw error
  } finally {
    if (context) {
      exitContextProvider(context)
    }
  }
}

const createElement = (vnode: VNode): Element => {
  const element = document.createElement(vnode.type as string)

  if (vnode.props) applyElementProps(element, vnode.props)
  for (const child of vnode.children) {
    const childElement = createElementFromVNode(child)
    if (childElement) element.appendChild(childElement)
  }

  return element
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
