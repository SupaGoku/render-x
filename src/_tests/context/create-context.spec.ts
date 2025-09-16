import { describe, expect, it } from 'vitest'
import {
  CONTEXT_MARKER,
  createContext,
  enterContextProvider,
  exitContextProvider,
  getContextFromComponent,
} from '../../context/create-context'
import { readContextValue } from '../../context/registry'
import { VNodeChild } from '../../types'

describe('createContext', () => {
  it('creates a provider component that passes through a single child', () => {
    const context = createContext('default')
    const child = {} as VNodeChild

    expect(context.defaultValue).toBe('default')
    expect(context.Provider({ children: [child] })).toBe(child)
    expect(() => context.Provider({ children: undefined })).toThrowError(
      'Context.Provider expects exactly one child element.'
    )

    const descriptor = Object.getOwnPropertyDescriptor(context.Provider, CONTEXT_MARKER)
    expect(descriptor?.enumerable).toBe(false)

    expect(getContextFromComponent(context.Provider)).toBe(context)
    expect(getContextFromComponent(null)).toBeUndefined()
  })

  it('returns the sole child when children is an array with one item', () => {
    const context = createContext('array')
    const child = true as VNodeChild

    expect(context.Provider({ children: [child] })).toBe(child)
  })

  it('normalizes single-child arrays with undefined entries to null', () => {
    const context = createContext('default')

    expect(context.Provider({ children: [undefined] })).toBeNull()
  })

  it('throws when multiple children are provided', () => {
    const context = createContext('value')
    const children = [{}, {}] as VNodeChild[]

    // @ts-expect-error - we're testing the error case
    expect(() => context.Provider({ children })).toThrowError('Context.Provider expects exactly one child element.')
  })
})

describe('context registry integration', () => {
  it('allows reading and restoring context values through the registry', () => {
    const context = createContext('fallback')

    expect(readContextValue(context)).toBe('fallback')

    enterContextProvider(context, 'provided')
    expect(readContextValue(context)).toBe('provided')

    exitContextProvider(context)
    expect(readContextValue(context)).toBe('fallback')
  })
})
