import { Fragment } from './fragment'
import { HookHost } from './hook-host'
import { VNode, VNodeChild, VNodeProps } from './types'
import { h } from './vdom'

export { Fragment }

type ComponentRenderer = (
  component: (props: any) => VNode,
  props: Record<string, any>,
  key: VNode['key'],
  children: VNodeChild[]
) => VNode

const renderComponent: ComponentRenderer = (
  component: (props: any) => VNode,
  props: Record<string, any>,
  key: VNode['key'],
  children: VNodeChild[]
): VNode => {
  const nextProps = { ...props }

  if (children.length === 1) {
    nextProps.children = children[0]
  } else if (children.length > 1) {
    nextProps.children = children
  }

  const vnode = HookHost(component, nextProps)

  if (key !== undefined && vnode && typeof vnode === 'object') {
    vnode.key = key
  }

  return vnode
}

const normalizeChildren = (children: VNodeChild[]): VNodeChild | VNodeChild[] => {
  if (children.length === 0) return undefined
  if (children.length === 1) return children[0]
  return children
}

const sanitizeProps = (props: VNodeProps | null | undefined): [VNode['key'], Record<string, any>] => {
  if (props == null) {
    return [undefined, {}]
  }

  const { key, ...rest } = props as VNodeProps & { key?: VNode['key'] }
  return [key, rest]
}

export const jsx = (
  type: string | ((props: any) => VNode),
  props: VNodeProps | null,
  ...children: VNodeChild[]
): VNode => {
  if (typeof type === 'function') {
    if (renderComponent == null) {
      throw new Error('No component renderer is configured. Ensure @render-x/core has been imported before rendering.')
    }

    const [key, componentProps] = sanitizeProps(props)
    const normalizedChildren = normalizeChildren(children)

    if (normalizedChildren !== undefined) {
      componentProps.children = normalizedChildren
    }

    const vnode = renderComponent(type as (props: any) => VNode, componentProps, key, children)

    if (key !== undefined && vnode && typeof vnode === 'object') {
      vnode.key = key
    }

    return vnode
  }

  return h(type as string, props, ...children)
}

export const jsxs = jsx
