import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { setHookContext } from '../../hooks/internal/context'
import { useCallback } from '../../hooks/use-callback'
import type { HookContext } from '../../types'

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

describe('useCallback', () => {
  it('memoizes callback references using dependency arrays', () => {
    const callback = () => 'value'
    const memo = useCallback(callback, [1])

    context.index = 0
    const same = useCallback(() => 'other', [1])
    expect(same).toBe(memo)

    context.index = 0
    const newCallback = () => 'updated'
    const changed = useCallback(newCallback, [2])
    expect(changed).toBe(newCallback)
    expect(changed()).toBe('updated')
  })
})
