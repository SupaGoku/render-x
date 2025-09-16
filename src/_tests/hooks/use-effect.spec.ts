import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { setHookContext } from '../../hooks/internal/context'
import { useEffect } from '../../hooks/use-effect'
import type { EffectHook, HookContext } from '../../types'

let context: HookContext

beforeEach(() => {
  context = {
    index: 0,
    hooks: [],
    component: {} as any,
    scheduleUpdate: vi.fn(),
  }
  setHookContext(context)
})

afterEach(() => {
  setHookContext(null)
})

describe('useEffect', () => {
  it('initializes a new effect hook', () => {
    const effect = vi.fn()
    useEffect(effect, [1])

    const hook = context.hooks[0] as EffectHook
    expect(hook.effect).toBe(effect)
    expect(hook.deps).toEqual([1])
    expect(hook.cleanup).toBeUndefined()
  })

  it('updates the effect when dependencies change', () => {
    const cleanup = vi.fn()
    const initial: EffectHook = {
      type: 'effect',
      effect: vi.fn(),
      deps: [1],
      cleanup,
    }
    context.hooks[0] = initial

    const nextEffect = vi.fn()
    context.index = 0
    useEffect(nextEffect, [2])

    expect(cleanup).toHaveBeenCalledTimes(1)
    const hook = context.hooks[0] as EffectHook
    expect(hook.effect).toBe(nextEffect)
    expect(hook.deps).toEqual([2])
  })

  it('updates the effect when dependencies are omitted', () => {
    const cleanup = vi.fn()
    const existing: EffectHook = {
      type: 'effect',
      effect: vi.fn(),
      deps: [1],
      cleanup,
    }
    context.hooks[0] = existing

    context.index = 0
    const effect = vi.fn()
    useEffect(effect)

    expect(cleanup).toHaveBeenCalledTimes(1)
    const hook = context.hooks[0] as EffectHook
    expect(hook.effect).toBe(effect)
    expect(hook.deps).toBeUndefined()
  })

  it('replaces the effect without triggering cleanup when dependencies match', () => {
    const cleanup = vi.fn()
    const existing: EffectHook = {
      type: 'effect',
      effect: vi.fn(),
      deps: [1],
      cleanup,
    }
    context.hooks[0] = existing

    context.index = 0
    const effect = vi.fn()
    useEffect(effect, [1])

    expect(cleanup).not.toHaveBeenCalled()
    const hook = context.hooks[0] as EffectHook
    expect(hook.effect).toBe(effect)
  })

  it('throws when hook type mismatches', () => {
    context.hooks[0] = { type: 'state' } as any

    expect(() => useEffect(vi.fn(), [])).toThrowError('Hook type mismatch at index 0: expected effect, got state')
  })
})
