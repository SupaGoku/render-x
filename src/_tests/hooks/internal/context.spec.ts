import { describe, expect, it } from 'vitest'
import { getHookContext, setHookContext } from '../../../hooks/internal/context'
import type { HookContext } from '../../../types'

describe('hook context', () => {
  it('throws when accessed outside of a component', () => {
    setHookContext(null)
    expect(() => getHookContext()).toThrowError('Hook called outside of component context')
  })

  it('returns the active hook context when set', () => {
    const context: HookContext = {
      index: 0,
      hooks: [],
      component: {} as any,
      scheduleUpdate: () => {
        /* noop */
      },
    }
    setHookContext(context)
    expect(getHookContext()).toBe(context)
    setHookContext(null)
  })
})
