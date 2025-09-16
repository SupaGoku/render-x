import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { setHookContext } from '../../hooks/internal/context'
import { useRef } from '../../hooks/use-ref'
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

describe('useRef', () => {
  it('creates persistent ref objects', () => {
    const ref = useRef(1)
    expect(ref.current).toBe(1)

    context.index = 0
    const sameRef = useRef(2)
    expect(sameRef).toBe(ref)
    expect(sameRef.current).toBe(1)
  })

  it('throws when hook type mismatches', () => {
    context.hooks[0] = { type: 'memo' } as any

    expect(() => useRef(1)).toThrowError('Hook type mismatch at index 0: expected ref, got memo')
  })
})
