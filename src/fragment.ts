import { RenderXElement, RenderXNode } from './types'
import { createNode } from './vdom'

export const FRAGMENT_TYPE = Symbol('__fragment__')

export interface FragmentNode extends RenderXNode {
  type: typeof FRAGMENT_TYPE
}

export const Fragment = ({ children }: { children?: RenderXElement | RenderXElement[] }) => {
  const childArray = Array.isArray(children) ? children : [children]

  return createNode(FRAGMENT_TYPE, null, childArray)
}

export const isFragmentNode = (node: any): node is FragmentNode => {
  return node?.type === FRAGMENT_TYPE
}
