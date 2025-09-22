import type { HookData } from '../../types'

export interface HookState {
  hooks: HookData[]
  renderCount: number
}

export interface HookInstance {
  state: HookState
  mounted: boolean
  unmounted: boolean
  scheduleUpdate: () => void
}
