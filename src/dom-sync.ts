import { getEventNameFromHandler, isDOMEventHandler } from './dom-events'
import { isFragmentNode } from './fragment'
import { isPortalNode } from './portal'
import { RenderXNode, RenderXProps, RenderXTree } from './types'
import { isNode } from './vdom'

export const syncDOM = (container: Element, oldTree: RenderXTree | null, newTree: RenderXTree): void => {
  if (!oldTree) {
    createElement(newTree, container)
  } else {
    patch(oldTree, newTree)
  }
}

const createElement = (tree: RenderXTree, parentDomElement?: Element | null): Node | null => {
  if (!isNode(tree.element)) {
    if (tree.element == null) {
      const textNode = document.createTextNode('')
      if (parentDomElement) parentDomElement.appendChild(textNode)
      return textNode
    }

    const textNode = document.createTextNode(String(tree.element))
    if (parentDomElement) parentDomElement.appendChild(textNode)
    return textNode
  }

  const effectiveParent = parentDomElement || (tree.element.__internal.findNextParentWithDomElement() as Element | null)

  if (isPortalNode(tree.element)) {
    const portal = tree.element
    for (const child of portal.__internal.children) {
      createElement(child, portal.portalTarget)
    }
    return null
  }

  if (isFragmentNode(tree.element)) {
    for (const child of tree.element.__internal.children) {
      createElement(child, effectiveParent)
    }
    return null
  }

  if (typeof tree.element.type === 'function') {
    for (const child of tree.element.__internal.children) {
      createElement(child, effectiveParent)
    }
    return null
  }

  const el = document.createElement(tree.element.type as string)
  tree.element.__internal.setDomElement(el)

  if (tree.element.props) updateProps(el, null, tree.element.props)

  for (const child of tree.element.__internal.children) {
    createElement(child, el)
  }

  if (effectiveParent) effectiveParent.appendChild(el)

  return el
}

const patch = (oldTree: RenderXTree, newTree: RenderXTree): void => {
  if (oldTree.isLeaf && newTree.isLeaf) {
    if (oldTree.element === newTree.element) return
    return
  }

  if (oldTree.isLeaf !== newTree.isLeaf) {
    replaceNode(oldTree, newTree)
    return
  }

  const oldNode = oldTree.element as RenderXNode
  const newNode = newTree.element as RenderXNode

  if (oldNode.type !== newNode.type || oldNode.key !== newNode.key) {
    return replaceNode(oldTree, newTree)
  }

  newNode.domElement = oldNode.domElement

  if (isPortalNode(newNode)) {
    if (isPortalNode(oldNode) && oldNode.portalTarget === newNode.portalTarget) {
      patchChildren(newNode.portalTarget, oldNode.__internal.children, newNode.__internal.children)
    } else {
      if (isPortalNode(oldNode)) {
        oldNode.portalTarget.innerHTML = ''
      }
      for (const child of newNode.__internal.children) {
        createElement(child, newNode.portalTarget)
      }
    }
    return
  }

  if (typeof newNode.type === 'function') {
    if (oldNode.__internal.children.length > 0 && newNode.__internal.children.length > 0)
      return patch(oldNode.__internal.children[0], newNode.__internal.children[0])
    else return
  }

  if (oldNode.props !== newNode.props && newNode.domElement) {
    updateProps(newNode.domElement as Element, oldNode.props, newNode.props)
  }

  patchChildren(newNode.domElement as Element, oldNode.__internal.children, newNode.__internal.children)
}

const patchChildren = (parent: Element, oldChildren: RenderXTree[], newChildren: RenderXTree[]): void => {
  const maxLength = Math.max(oldChildren.length, newChildren.length)

  for (let i = 0; i < maxLength; i++) {
    const oldChild = oldChildren[i]
    const newChild = newChildren[i]

    if (!oldChild) {
      createElement(newChild, parent)
    } else if (!newChild) {
      if (isNode(oldChild.element)) {
        if (isPortalNode(oldChild.element)) {
          oldChild.element.portalTarget.innerHTML = ''
        } else if (oldChild.element.domElement) {
          oldChild.element.domElement.remove()
        }
      } else if (parent.childNodes[i]) {
        parent.childNodes[i].remove()
      }
    } else if (oldChild?.isLeaf && newChild?.isLeaf) {
      const oldText = String(oldChild.element)
      const newText = String(newChild.element)
      if (oldText !== newText) {
        const textNode = parent.childNodes[i]
        if (textNode && textNode.nodeType === Node.TEXT_NODE) {
          textNode.textContent = newText
        } else {
          const newTextNode = document.createTextNode(newText)
          if (parent.childNodes[i]) {
            parent.replaceChild(newTextNode, parent.childNodes[i])
          } else {
            parent.appendChild(newTextNode)
          }
        }
      }
    } else {
      patch(oldChild, newChild)
    }
  }
}

const replaceNode = (oldTree: RenderXTree, newtree: RenderXTree): void => {
  if (isNode(oldTree.element) && isPortalNode(oldTree.element)) {
    oldTree.element.portalTarget.innerHTML = ''
  }

  const el = isNode(oldTree.element) ? oldTree.element.domElement : oldTree.element
  const parent = (el as any)?.parentNode

  if (parent) {
    const newEl = createElement(newtree, parent as Element)
    if (newEl && el) parent.replaceChild(newEl, el as Node)
  }
}

const updateProps = (el: Element, oldProps: RenderXProps | null, newProps: RenderXProps | null): void => {
  oldProps = oldProps || {}
  newProps = newProps || {}

  for (const key in oldProps) if (!(key in newProps)) removeProp(el, key)

  for (const key in newProps) {
    const oldValue = oldProps[key]
    const newValue = newProps[key]
    if (oldValue !== newValue) {
      setProp(el, key, newValue)
    }
  }
}

const setProp = (el: Element, key: string, value: any): void => {
  if (key === 'className') {
    el.className = value || ''
  } else if (key === 'style') {
    if (typeof value === 'string') {
      el.setAttribute('style', value)
    } else if (value && typeof value === 'object') {
      Object.assign((el as HTMLElement).style, value)
    }
  } else if (isDOMEventHandler(key)) {
    const eventName = getEventNameFromHandler(key)

    if (typeof value === 'function') {
      const oldHandler = (el as any)[`__${key}`]
      if (oldHandler) {
        el.removeEventListener(eventName, oldHandler)
      }
      ;(el as any).addEventListener(eventName, value)
      ;(el as any)[`__${key}`] = value
    }
  } else if (key === 'value' && el instanceof HTMLInputElement) {
    el.value = value || ''
  } else if (key === 'checked' && el instanceof HTMLInputElement) {
    el.checked = !!value
  } else if (key !== 'children' && value != null && value !== false) {
    el.setAttribute(key, String(value))
  }
}

const removeProp = (el: Element, key: string): void => {
  if (key === 'className') {
    el.className = ''
  } else if (key === 'style') {
    el.removeAttribute('style')
  } else if (isDOMEventHandler(key)) {
    const eventName = getEventNameFromHandler(key)
    const handler = (el as any)[`__${key}`]
    if (handler) {
      el.removeEventListener(eventName, handler)
      delete (el as any)[`__${key}`]
    }
  } else {
    el.removeAttribute(key)
  }
}
