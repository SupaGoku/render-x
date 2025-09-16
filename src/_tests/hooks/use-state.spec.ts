import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { setHookContext } from '../../hooks/internal/context'
import { useState } from '../../hooks/use-state'
import type { HookContext, StateHook } from '../../types'

let context: HookContext
let scheduleUpdate: ReturnType<typeof vi.fn>

beforeEach(() => {
  scheduleUpdate = vi.fn()
  context = {
    index: 0,
    hooks: [],
    component: {} as any,
    scheduleUpdate,
  }
  setHookContext(context)
})

afterEach(() => {
  setHookContext(null)
})

describe('useState', () => {
  it('initializes state from a value factory and schedules updates on change', () => {
    const [value, setValue] = useState(() => 1)

    expect(value).toBe(1)

    setValue(2)
    expect(scheduleUpdate).toHaveBeenCalledTimes(1)
    expect((context.hooks[0] as StateHook).value).toBe(2)

    setValue(2)
    expect(scheduleUpdate).toHaveBeenCalledTimes(1)
  })

  it('returns the existing state on subsequent renders', () => {
    const [, setValue] = useState(0)

    context.index = 0
    const [nextValue] = useState(0)

    expect(nextValue).toBe(0)

    setValue((prev: number) => prev + 1)
    expect((context.hooks[0] as StateHook).value).toBe(1)
  })

  it('throws when hook types do not match', () => {
    context.hooks[0] = { type: 'memo' } as any

    expect(() => useState(0)).toThrowError('Hook type mismatch at index 0: expected state, got memo')
  })
})
