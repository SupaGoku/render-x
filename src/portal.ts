import { BaseComponentProps, RenderXElement, RenderXNode } from './types'
import { createNode } from './vdom'

export const PORTAL_TYPE = Symbol('__portal__')

export interface PortalProps extends BaseComponentProps {
  target: Element | string
}

export interface PortalNode extends RenderXNode {
  type: typeof PORTAL_TYPE
  portalTarget: Element
  treeParent?: RenderXNode
}

export const createPortal = (children: RenderXElement | RenderXElement[], target: Element | string): PortalNode => {
  const childArray = Array.isArray(children) ? children : [children]
  const node = createNode(PORTAL_TYPE, null, childArray) as PortalNode
  const targetElement = typeof target === 'string' ? document.querySelector(target) : target

  if (!targetElement) throw new Error(`Portal target not found: ${target}`)

  node.portalTarget = targetElement

  return node
}

export const Portal = ({ children, target }: PortalProps): PortalNode => {
  const targetElement = typeof target === 'string' ? document.querySelector(target) : target
  if (!targetElement) throw new Error(`Portal target not found: ${target}`)

  return createPortal(children, targetElement)
}

export const isPortalNode = (node: any): node is PortalNode => {
  return node?.type === PORTAL_TYPE
}
