import { jsx } from './jsx-runtime'
import { useEffect } from './hooks'
import type { VNode, VNodeChild } from './types'

import { render } from './render'

export interface PortalProps {
  children: VNodeChild
  target: Element | string
}

export const Portal = ({ children, target }: PortalProps): VNode => {
  useEffect(() => {
    const targetElement = typeof target === 'string' ? document.querySelector(target) : target

    if (!targetElement) {
      console.error('Portal target not found:', target)
      return undefined
    }

    render(targetElement, children as VNode)
  }, [children, target])

  return null as any
}

export const createPortal = (children: VNodeChild, target: Element | string): VNode => {
  return jsx(Portal, { target }, children)
}
