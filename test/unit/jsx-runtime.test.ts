import { describe, expect, test, vi } from 'vitest'
import { FRAGMENT_TYPE } from '../../src/fragment'
import { Fragment, jsx, jsxs, RenderXNode } from '../../src/jsx-runtime'

describe('JSX Runtime', () => {
  describe('jsx', () => {
    test('creates element nodes', () => {
      const node = jsx('div', { className: 'test' })
      expect(node.type).toBe('div')
      expect(node.props?.className).toBe('test')
    })

    test('handles null props', () => {
      const node = jsx('div', null)
      expect(node.type).toBe('div')
      expect(node.props).toEqual({})
      expect(node.children).toEqual([])
    })

    test('handles undefined props', () => {
      const node = jsx('div', null)
      expect(node.type).toBe('div')
      expect(node.props).toEqual({})
      expect(node.children).toEqual([])
    })

    test('handles children as single element', () => {
      const child = jsx('span', { children: 'text' })
      const node = jsx('div', { children: child })
      expect(node.children).toEqual([child])
    })

    test('handles children as array', () => {
      const children = [jsx('span', { children: 'one' }), jsx('span', { children: 'two' })]
      const node = jsx('div', { children })
      expect(node.children).toEqual(children)
    })

    test('handles text children', () => {
      const node = jsx('div', { children: 'Hello World' })
      expect(node.children).toEqual(['Hello World'])
    })

    test('creates component nodes', () => {
      const Component = (props: any) => jsx('div', props)
      const node = jsx(Component, { className: 'test' })

      expect(typeof node.type).toBe('function')
      expect(node.type).toBe(Component)
      expect(node.props?.className).toBe('test')
    })

    test('extracts key from props for components', () => {
      const Component = () => jsx('div', null)
      const node = jsx(Component, { key: 'test-key', foo: 'bar' })

      expect(node.key).toBe('test-key')
      expect(node.props?.key).toBeUndefined()
      expect(node.props?.foo).toBe('bar')
    })

    test('uses explicit key parameter over props key', () => {
      const Component = () => jsx('div', null)
      const node = jsx(Component, { key: 'prop-key' }, 'explicit-key')

      expect(node.key).toBe('explicit-key')
    })

    test('strips children from component props', () => {
      const Component = (props: any) => jsx('div', props)
      const children = ['child1', 'child2']
      const node = jsx(Component, { children, foo: 'bar' })

      expect(node.props?.children).toBeUndefined()
      expect(node.props?.foo).toBe('bar')
      expect(node.children).toEqual(children)
    })

    test('handles component with no children', () => {
      const Component = () => jsx('div', null)
      const node = jsx(Component, { foo: 'bar' })

      expect(node.props?.foo).toBe('bar')
      expect(node.children).toEqual([])
    })

    test('preserves all props for DOM elements', () => {
      const node = jsx('input', {
        type: 'text',
        value: 'test',
        disabled: true,
        'data-test': 'value',
      })

      expect(node.props).toEqual({
        type: 'text',
        value: 'test',
        disabled: true,
        'data-test': 'value',
      })
    })

    test('handles boolean props', () => {
      const node = jsx('button', { disabled: true, hidden: false })
      expect(node.props?.disabled).toBe(true)
      expect(node.props?.hidden).toBe(false)
    })

    test('handles event handler props', () => {
      const onClick = vi.fn()
      const node = jsx('button', { onClick })
      expect(node.props?.onClick).toBe(onClick)
    })
  })

  describe('jsxs', () => {
    test('jsxs is identical to jsx', () => {
      expect(jsxs).toBe(jsx)
    })

    test('handles multiple children correctly', () => {
      const children = [jsx('span', { children: 'one' }), 'text node', jsx('span', { children: 'two' })]
      const node = jsxs('div', { children })
      expect(node.children).toEqual(children)
    })
  })

  describe('Fragment', () => {
    test('creates fragment node with children', () => {
      const children = [jsx('div', { children: 'one' }), jsx('div', { children: 'two' })]
      const node = Fragment({ children })

      expect(node.type).toBe(FRAGMENT_TYPE)
      expect(node.props).toEqual({})
      expect(node.children).toEqual(children)
    })

    test('handles single child', () => {
      const child = jsx('div', { children: 'single' })
      const node = Fragment({ children: child })

      expect(node.type).toBe(FRAGMENT_TYPE)
      expect(node.children).toEqual([child])
    })

    test('handles undefined children', () => {
      const node = Fragment({})

      expect(node.type).toBe(FRAGMENT_TYPE)
      expect(node.children).toEqual([''])
    })

    test('handles empty children array', () => {
      const node = Fragment({ children: [] })

      expect(node.type).toBe(FRAGMENT_TYPE)
      expect(node.children).toEqual([])
    })

    test('handles text children', () => {
      const node = Fragment({ children: 'text content' as any })

      expect(node.type).toBe(FRAGMENT_TYPE)
      expect(node.children).toEqual(['text content'])
    })

    test('handles mixed children types', () => {
      const children = ['text', jsx('div', null), null, undefined, jsx('span', { children: 'nested' })]
      const node = Fragment({ children: children as any })

      expect(node.children[0]).toBe('text')
      expect((node.children[1] as RenderXNode)?.type).toBe('div')
      expect(node.children[2]).toBe('')
      expect(node.children[3]).toBe('')
      expect((node.children[4] as RenderXNode)?.type).toBe('span')
      expect(node.children.length).toBe(5)
    })
  })
})
