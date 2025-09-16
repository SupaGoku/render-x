import { describe, expect, it } from 'vitest'
import { VNodeChild } from '../types'
import { h, isSameNodeType, isVNode } from '../vdom'

describe('h', () => {
  it('creates a vnode without props and flattens children', () => {
    const vnode = h('div', null, 'hello', ...([null, ['world']] as unknown as VNodeChild[]))

    expect(vnode).toEqual({
      type: 'div',
      props: {},
      children: ['hello', 'world'],
      key: undefined,
    })
  })

  it('respects keyed props and flattens nested children', () => {
    const vnode = h('span', { key: 'id', title: 'demo' }, ...(['text', ['more', null], 42] as VNodeChild[]))

    expect(vnode.type).toBe('span')
    expect(vnode.props).toEqual({ title: 'demo' })
    expect(vnode.key).toBe('id')
    expect(vnode.children).toEqual(['text', 'more', 42])
  })
})

describe('isVNode', () => {
  it('identifies valid vnode objects', () => {
    const vnode = h('div', null)
    expect(isVNode(vnode)).toBe(true)
    expect(isVNode({})).toBe(false)
  })
})

describe('isSameNodeType', () => {
  it('compares type and key equality', () => {
    const a = h('div', { key: 'a' })
    const b = h('div', { key: 'a' })
    const c = h('span', { key: 'a' })

    expect(isSameNodeType(a, b)).toBe(true)
    expect(isSameNodeType(a, c)).toBe(false)
  })
})
