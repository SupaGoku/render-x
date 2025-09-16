export type VNodeType = string | ((props: any) => VNode)
import type { Properties as CssProperties } from 'csstype'

export interface VNodeProps {
  [key: string]: any
  id?: string
  className?: string
  style?: string | Partial<CssProperties>
  'data-key'?: string | number
  'data-index'?: number
  'data-size-id'?: number
  onClick?: (event: MouseEvent) => void
  onInput?: (event: InputEvent) => void
  onSubmit?: (event: SubmitEvent) => void
  onKeydown?: (event: KeyboardEvent) => void
  onFocus?: (event: FocusEvent) => void
  onBlur?: (event: FocusEvent) => void
}

export interface VNode {
  type: VNodeType
  props: VNodeProps | null
  children: VNodeChild[]
  key?: string | number
  id?: string
}

export interface Ref<T> {
  current: T | null
}

export type VNodeChild = VNode | string | number | boolean | null | undefined

export interface RenderFunction {
  (root: Element, vnode: VNodeChild): void
}

export type DelegatedEventType = 'click' | 'input' | 'submit' | 'keydown' | 'keyup' | 'focus' | 'blur'

export interface DomAttributes {
  [key: string]: any
  style?: string | Partial<CssProperties>
}

export interface EventContext {
  type: DelegatedEventType
  handler: (event: Event) => void

  element: Element
}

export interface BaseComponentProps {
  key?: string | number
  id?: string
  children?: VNodeChild | VNodeChild[]
}

interface FunctionalComponentProps extends BaseComponentProps {
  className?: string
}

export type FunctionalComponent<P = {}> = (props: P & DomAttributes & FunctionalComponentProps) => VNode

declare global {
  namespace JSX {
    interface Element extends VNode {}
    interface IntrinsicElements {
      [elemName: string]: VNodeProps & {
        key?: string | number
        id?: string
      }
    }
    interface IntrinsicAttributes {
      key?: string | number
      id?: string
    }
    interface ElementChildrenAttribute {
      children: {}
    }
    interface ElementAttributesProperty {
      props: {}
    }
  }
}
