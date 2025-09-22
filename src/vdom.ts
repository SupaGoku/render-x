import { RenderXComponentType, RenderXElement, RenderXNode, RenderXProps } from './types'

export const h = (
  type: RenderXComponentType,
  props: RenderXProps | null = null,
  ...children: RenderXElement[]
): RenderXNode => createNode(type, props, children)

const normalizeChildren = (children: RenderXElement[]): RenderXElement[] => {
  const result: RenderXElement[] = []

  for (const child of children) {
    if (Array.isArray(child)) {
      result.push(...normalizeChildren(child))
    } else if (child == null || typeof child === 'boolean') {
      result.push('')
    } else {
      result.push(child)
    }
  }

  return result
}

export const createNode = (
  type: RenderXComponentType,
  props: RenderXProps | null,
  children: RenderXElement[]
): RenderXNode => {
  const normalizedChildren = normalizeChildren(children)

  let key: RenderXNode['key'] = undefined
  let cleanProps: RenderXProps = {}

  if (props != null) {
    const { key: propKey, ...rest } = props as RenderXProps & { key?: RenderXNode['key'] }
    key = propKey
    cleanProps = rest
  }

  const node: RenderXNode = {
    type,
    props: cleanProps,
    children: normalizedChildren,
    key,
    domElement: undefined,
    __internal: {
      children: [],
      clone: function () {
        const clonedProps = node.props ? { ...node.props, key: node.key } : null
        const cloned = createNode(node.type, clonedProps, [...node.children])

        cloned.__internal.setDomElement(node.domElement)
        cloned.__internal.setParent(node.parent)
        cloned.__internal.setContext(node.context)
        cloned.__internal.setHookInstance(node.hookInstance)

        if ('portalTarget' in node) (cloned as any).portalTarget = (node as any).portalTarget

        return cloned
      },
      setTreeChildren: function (children) {
        if (node.__internal.children !== children) node.__internal.children = children
      },
      setDomElement: function (domElement) {
        if (node.domElement !== domElement) node.domElement = domElement
      },
      setParent: function (parent) {
        if (node.parent !== parent) node.parent = parent
      },
      setContext: function (context) {
        if (node.context !== context) node.context = context
      },
      setHookInstance: function (hookInstance) {
        if (node.hookInstance !== hookInstance) node.hookInstance = hookInstance
      },
      findNextParentWithDomElement: function () {
        let parent = node.parent
        while (parent && !parent.domElement) parent = parent.parent

        return parent?.domElement ?? null
      },
    },
  }

  return node
}

export const isNode = (value: any): value is RenderXNode => {
  return value && typeof value === 'object' && 'type' in value && 'props' in value && 'children' in value
}
