import { describe, expect, it, vi } from 'vitest'
import { cleanupEffects, isEffectHook, runEffects } from '../../../hooks/internal/effect-utils'
import type { EffectHook, HookContext } from '../../../types'

describe('effect utils', () => {
  it('identifies effect hooks', () => {
    expect(isEffectHook(undefined)).toBe(false)
    expect(isEffectHook({ type: 'effect' } as any)).toBe(true)
    expect(isEffectHook({ type: 'memo' } as any)).toBe(false)
  })

  it('runs effects and registers cleanup handlers', () => {
    const cleanup = vi.fn()
    const effect = vi.fn(() => cleanup)
    const hook: EffectHook = {
      type: 'effect',
      effect,
      deps: undefined,
      cleanup: undefined,
    }

    const context: HookContext = {
      index: 0,
      hooks: [hook],
      component: {} as any,
      scheduleUpdate: vi.fn(),
    }

    runEffects(context)
    expect(effect).toHaveBeenCalledTimes(1)
    expect(hook.cleanup).toBe(cleanup)

    cleanupEffects(context)
    expect(cleanup).toHaveBeenCalledTimes(1)
    expect(hook.cleanup).toBeUndefined()
  })
})
