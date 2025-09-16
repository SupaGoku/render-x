import { describe, expect, it, vi } from 'vitest'
import * as hooksInternal from '../hooks/internal'
import { Fragment, jsx, jsxs } from '../jsx-runtime'
import { VNodeChild } from '../types'

const TestComponent = () => ({ type: 'div', props: {}, children: [] }) as any

describe('jsx-runtime', () => {
  it('creates intrinsic element vnodes', () => {
    const vnode = jsx('div', { id: 'demo' }, 'child')

    expect(vnode.type).toBe('div')
    expect(vnode.props).toEqual({ id: 'demo' })
    expect(vnode.children).toEqual(['child'])
  })

  it('delegates function components through withHooks and applies keys', () => {
    const spy = vi.spyOn(hooksInternal, 'withHooks').mockImplementation((component, props) => {
      return { type: component, props, children: [], key: undefined } as any
    })

    const vnode = jsx(TestComponent, { key: '123', foo: 'bar' }, 'child')

    expect(spy).toHaveBeenCalledWith(TestComponent, { foo: 'bar', children: 'child' })
    expect(vnode.key).toBe('123')
    expect(vnode.props).toEqual({ foo: 'bar', children: 'child' })

    spy.mockRestore()
  })

  it('sanitizes props when null is provided', () => {
    const spy = vi.spyOn(hooksInternal, 'withHooks').mockImplementation((component, props) => {
      return { type: component, props, children: [], key: undefined } as any
    })

    jsx(TestComponent, null)

    expect(spy).toHaveBeenCalledWith(TestComponent, {})
    spy.mockRestore()
  })

  it('normalizes multiple children for function components', () => {
    const spy = vi.spyOn(hooksInternal, 'withHooks').mockImplementation((component, props) => {
      return { type: component, props, children: [], key: undefined } as any
    })

    const props = { foo: 1 }
    const children = ['a', 'b'] as VNodeChild[]

    jsxs(TestComponent, props, ...children)

    expect(spy).toHaveBeenCalledWith(TestComponent, { ...props, children })
    spy.mockRestore()
  })

  it('re-exports Fragment', () => {
    const vnode = Fragment({ children: null })
    expect(vnode.type).toBe('fragment')
  })
})
