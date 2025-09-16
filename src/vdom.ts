import { VNode, VNodeChild, VNodeProps } from './types'

export const h = (type: string, props: VNodeProps | null = null, ...children: VNodeChild[]): VNode => {
  if (props == null) {
    return {
      type,
      props: {},
      children: flattenChildren(children),
      key: undefined,
    }
  }

  const { key, ...rest } = props as VNodeProps & { key?: VNode['key'] }

  return {
    type,
    props: rest,
    children: flattenChildren(children),
    key,
  }
}

const flattenChildren = (children: VNodeChild[]): VNodeChild[] => {
  const result: VNodeChild[] = []

  for (const child of children) {
    if (Array.isArray(child)) {
      result.push(...flattenChildren(child))
    } else if (child != null) {
      result.push(child)
    }
  }

  return result
}

export const isVNode = (value: any): value is VNode => {
  return value && typeof value === 'object' && 'type' in value && 'props' in value && 'children' in value
}

export const isSameNodeType = (a: VNode, b: VNode): boolean => {
  return a.type === b.type && a.key === b.key
}
