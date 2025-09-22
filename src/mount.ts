import { getContextFromComponent } from './context/create-context'
import { setHookContext } from './hooks/internal/context'
import { HookInstance } from './hooks/internal/types'
import { isPortalNode } from './portal'
import { RenderXElement, RenderXLeafNode, RenderXNode, RenderXTree } from './types'
import { isNode } from './vdom'

export const mountTree = (element: RenderXElement) => buildTree(element)

export const updateTree = (oldElement: RenderXElement, newElement: RenderXElement) => buildTree(newElement, oldElement)

const buildTree = (
  element: RenderXElement,
  oldElement: RenderXElement = null,
  parent: RenderXNode | null = null
): RenderXTree => {
  if (!isNode(element)) {
    return {
      element,
      isLeaf: true,
    } as RenderXLeafNode
  }

  const newElement = element.__internal.clone()

  if (isNode(oldElement) && oldElement.type === element.type && oldElement.domElement) {
    newElement.__internal.setDomElement(oldElement.domElement)
  }

  newElement.__internal.setParent(parent)

  let childrenToProcess = newElement.children

  if (typeof newElement.type === 'function') {
    const hookInstance = getOrCreateHookInstance(newElement, oldElement)
    newElement.__internal.setHookInstance(hookInstance)

    const hookContext = {
      index: 0,
      node: newElement,
      hookInstance,
    }

    setHookContext(hookContext)

    const contextDef = getContextFromComponent(newElement.type)
    if (contextDef) {
      const value = newElement.props?.value ?? contextDef.defaultValue

      newElement.__internal.setContext({ definition: contextDef, value })
    }

    const propsWithChildren = {
      ...(newElement.props || {}),
      children: newElement.children,
    }
    const componentResult = newElement.type(propsWithChildren)
    childrenToProcess = [componentResult]
  }

  const processedChildren = childrenToProcess.map((child, index) => {
    const oldTreeChild =
      isNode(oldElement) && oldElement.__internal.children ? oldElement.__internal.children[index] : undefined
    const oldChildElement = oldTreeChild?.element

    if (isNode(child) && isPortalNode(child) && newElement) {
      child.treeParent = newElement
    }

    return buildTree(child, oldChildElement, newElement)
  })

  newElement.__internal.setTreeChildren(processedChildren)

  return {
    element: newElement,
    isLeaf: processedChildren.length === 0,
  }
}

const getOrCreateHookInstance = (newElement: RenderXNode, oldElement: RenderXElement | null): HookInstance => {
  if (isNode(oldElement) && oldElement.type === newElement.type && oldElement.hookInstance) {
    return oldElement.hookInstance
  }

  return createComponentHookInstance()
}

const createComponentHookInstance = (): HookInstance => ({
  state: {
    hooks: [],
    renderCount: 0,
  },
  mounted: false,
  unmounted: false,
  scheduleUpdate: () => {},
})
