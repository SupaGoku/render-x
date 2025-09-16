import type { HookData, VNode } from '../../types'

export interface HookState {
  hooks: HookData[]
  renderCount: number
}

export interface HookInstance {
  component: (props: any) => VNode
  props: any
  state: HookState
  mounted: boolean
  unmounted: boolean
  container?: Element
  vnode?: VNode
  scheduleUpdate: () => void
}
