import type { Properties as CssProperties } from 'csstype'
import { RenderXContext } from './context/types'
import { HookInstance } from './hooks/internal/types'

export interface RenderXProps {
  [key: string]: any
  id?: string
  className?: string
  style?: string | Partial<CssProperties>
  onClick?: (event: MouseEvent) => void
  onInput?: (event: InputEvent) => void
  onSubmit?: (event: SubmitEvent) => void
  onKeydown?: (event: KeyboardEvent) => void
  onFocus?: (event: FocusEvent) => void
  onBlur?: (event: FocusEvent) => void
}

export interface RenderXNode {
  type: RenderXComponentType
  props: RenderXProps | null
  children: RenderXElement[]
  key?: string | number
  id?: string
  domElement?: Element | Text
  parent?: RenderXNode | null
  context?: RenderXNodeContext<unknown>
  hookInstance?: HookInstance

  __internal: {
    children: RenderXTree[]
    clone: () => RenderXNode
    setTreeChildren: (children: RenderXTree[]) => void
    setDomElement: (domElement: Element | Text) => void
    setParent: (parent: RenderXNode | null) => void
    setContext: (context: RenderXNodeContext<unknown>) => void
    setHookInstance: (hookInstance: HookInstance) => void
    findNextParentWithDomElement: () => Element | Text | null
  }
}

export interface RenderXNodeContext<T> {
  definition: RenderXContext<T>
  value: T
}

export interface Ref<T> {
  current: T | null
}

export type RenderXElement = RenderXNode | Element | string | number | boolean | null
export type RenderXComponentType = RenderXComponent | Symbol | string

export interface BaseComponentProps {
  key?: string | number
  id?: string
  children?: RenderXElement | RenderXElement[]
}

interface RenderXComponentProps extends BaseComponentProps {
  className?: string
}

export type RenderXComponent<P = {}> = (props: P & RenderXComponentProps) => RenderXNode

interface BaseRenderXTree {
  element: RenderXElement
  isLeaf?: boolean
  tree?: BaseRenderXTree
}

export interface RenderXTreeNode extends BaseRenderXTree {
  isLeaf: false
  tree?: RenderXTreeNode
}

export interface RenderXLeafNode extends BaseRenderXTree {
  isLeaf: true
  tree?: never
}

export type RenderXTree = RenderXTreeNode | RenderXLeafNode

export interface StateHook<T = any> {
  type: 'state'
  value: T
  setter: (value: T | ((prev: T) => T)) => void
}

export interface EffectHook {
  type: 'effect'
  effect: () => void | (() => void)
  deps?: readonly any[]
  cleanup?: () => void
  shouldRun?: boolean
}

export interface RefHook<T = any> {
  type: 'ref'
  current: T
}

export interface MemoHook<T = any> {
  type: 'memo'
  value: T
  deps?: readonly any[]
}

export type HookData = StateHook | EffectHook | RefHook | MemoHook

export interface HookContext {
  index: number
  node: RenderXNode
  hookInstance: HookInstance
}

declare global {
  namespace JSX {
    interface Element extends RenderXNode {}
    interface IntrinsicElements {
      [elemName: string]: RenderXProps & {
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
