import { describe, expect, it } from 'vitest'
import { createContext, enterContextProvider, exitContextProvider } from '../../context/create-context'
import { useContext } from '../../hooks/use-context'

describe('useContext', () => {
  it('throws when context is invalid', () => {
    expect(() => useContext(undefined as any)).toThrowError(
      'useContext requires a valid context object returned by createContext'
    )
  })

  it('reads the default value when no provider is active', () => {
    const context = createContext('default')

    expect(useContext(context)).toBe('default')
  })

  it('reads the latest provided value from the context stack', () => {
    const context = createContext('default')

    enterContextProvider(context, 'first')
    expect(useContext(context)).toBe('first')

    enterContextProvider(context, 'second')
    expect(useContext(context)).toBe('second')

    exitContextProvider(context)
    expect(useContext(context)).toBe('first')

    exitContextProvider(context)
    expect(useContext(context)).toBe('default')
  })
})
