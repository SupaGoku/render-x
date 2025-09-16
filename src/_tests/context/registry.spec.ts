import { describe, expect, it } from 'vitest'
import { beginContext, endContext, readContextValue } from '../../context/registry'
import type { RenderXContext } from '../../context/types'

const makeContext = <T>(defaultValue: T): RenderXContext<T> => ({
  id: Symbol('context'),
  defaultValue,
  Provider: (() => null) as any,
})

describe('context registry', () => {
  it('returns default values when stack is empty', () => {
    const context = makeContext('default')
    expect(readContextValue(context)).toBe('default')
  })

  it('maintains a push/pop stack per context', () => {
    const context = makeContext(0)

    beginContext(context, 1)
    beginContext(context, 2)

    expect(readContextValue(context)).toBe(2)

    endContext(context)
    expect(readContextValue(context)).toBe(1)

    endContext(context)
    expect(readContextValue(context)).toBe(0)
  })

  it('isolates values across different contexts', () => {
    const alpha = makeContext('a')
    const beta = makeContext('b')

    beginContext(alpha, 'alpha-1')
    expect(readContextValue(beta)).toBe('b')

    beginContext(beta, 'beta-1')
    expect(readContextValue(alpha)).toBe('alpha-1')
    expect(readContextValue(beta)).toBe('beta-1')

    endContext(alpha)
    expect(readContextValue(alpha)).toBe('a')
    expect(readContextValue(beta)).toBe('beta-1')
  })
})
