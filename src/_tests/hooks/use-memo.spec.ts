import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { setHookContext } from '../../hooks/internal/context'
import { useMemo } from '../../hooks/use-memo'
import type { HookContext, MemoHook } from '../../types'

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

describe('useMemo', () => {
  it('creates memoized values and caches them by dependency array', () => {
    const factory = vi.fn(() => 1)
    const value = useMemo(factory, [1])

    expect(value).toBe(1)
    expect(factory).toHaveBeenCalledTimes(1)

    context.index = 0
    const same = useMemo(factory, [1])
    expect(same).toBe(1)
    expect(factory).toHaveBeenCalledTimes(1)

    context.index = 0
    const updated = useMemo(() => 2, [2])
    expect(updated).toBe(2)
    const hook = context.hooks[0] as MemoHook<number>
    expect(hook.deps).toEqual([2])
  })

  it('recomputes when dependencies are omitted', () => {
    const hook: MemoHook<number> = {
      type: 'memo',
      value: 1,
      deps: [1],
    }
    context.hooks[0] = hook

    context.index = 0
    const value = useMemo(() => 2)

    expect(value).toBe(2)
    expect(hook.deps).toBeUndefined()
  })

  it('throws when hook type mismatches', () => {
    context.hooks[0] = { type: 'state' } as any

    expect(() => useMemo(() => 1, [])).toThrowError('Hook type mismatch at index 0: expected memo, got state')
  })
})
