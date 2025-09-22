import { RenderXComponentType, RenderXElement, RenderXNode, RenderXProps } from './types'
import { createNode } from './vdom'

export { Fragment } from './fragment'
export type { RenderXComponentType, RenderXElement, RenderXNode, RenderXProps }

const sanitizeProps = (props: RenderXProps | null | undefined): [RenderXNode['key'], Record<string, any>] => {
  if (props == null) {
    return [undefined, {}]
  }

  const { key, ...rest } = props as RenderXProps & { key?: RenderXNode['key'] }
  return [key, rest]
}

export const jsx = (type: RenderXComponentType, props: RenderXProps | null, key?: any): RenderXNode => {
  const propsWithChildren = props || {}
  const children = propsWithChildren.children || []

  if (typeof type === 'function') {
    const [extractedKey, componentProps] = sanitizeProps(props)
    const finalKey = key !== undefined ? key : extractedKey

    const { children: _, ...propsWithoutChildren } = componentProps
    const node = createNode(
      type as RenderXComponentType,
      propsWithoutChildren,
      Array.isArray(children) ? children : [children]
    )

    if (finalKey !== undefined) node.key = finalKey

    return node
  }

  return createNode(type as string, props, Array.isArray(children) ? children : [children])
}

export const jsxs = jsx
