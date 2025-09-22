import { PortalNode } from './portal'
import { RenderXNode } from './types'

export const getPortalOriginContext = (portal: PortalNode): RenderXNode | null => {
  return portal.treeParent || portal.parent || null
}

export const getPortalTreePath = (portal: PortalNode): RenderXNode[] => {
  const path: RenderXNode[] = []
  let current: RenderXNode | null | undefined = portal.treeParent

  while (current) {
    path.unshift(current)
    current = current.parent
  }

  return path
}

export const isPortalDescendantOf = (portal: PortalNode, ancestor: RenderXNode): boolean => {
  let current: RenderXNode | null | undefined = portal.treeParent

  while (current) {
    if (current === ancestor) return true
    current = current.parent
  }

  return false
}