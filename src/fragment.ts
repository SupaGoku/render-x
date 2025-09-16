import { VNode, VNodeChild } from './types'

export interface FragmentProps {
  children?: VNodeChild | VNodeChild[]
}

export const Fragment = ({ children }: FragmentProps): VNode => {
  const normalizedChildren = Array.isArray(children) ? children : [children]

  return {
    type: 'fragment',
    props: {},
    children: normalizedChildren,
    key: undefined,
  } as VNode
}
