import { describe, expect, it } from 'vitest'
import { Fragment } from '../fragment'

describe('Fragment', () => {
  it('wraps non-array children in an array', () => {
    const vnode = Fragment({ children: 'text' })

    expect(vnode.children).toEqual(['text'])
    expect(vnode.type).toBe('fragment')
  })

  it('keeps array children intact', () => {
    const vnode = Fragment({ children: ['a', 'b'] })

    expect(vnode.children).toEqual(['a', 'b'])
  })
})
