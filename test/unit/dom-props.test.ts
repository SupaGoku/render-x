import { describe, test, expect, beforeEach } from 'vitest'
import { setElementStyle, classNamesMatch, applyElementProps, updateElementProps } from '../../src/dom-props'

describe('DOM Props', () => {
  let element: HTMLDivElement

  beforeEach(() => {
    element = document.createElement('div')
  })

  describe('setElementStyle', () => {
    test('applies string styles correctly', () => {
      setElementStyle(element, 'color: red; background: blue;')
      expect(element.style.cssText).toContain('color: red')
      expect(element.style.cssText).toContain('background: blue')
    })

    test('applies object styles correctly', () => {
      setElementStyle(element, { color: 'red', backgroundColor: 'blue' })
      expect(element.style.color).toBe('red')
      expect(element.style.backgroundColor).toBe('blue')
    })

    test('handles null/undefined styles', () => {
      setElementStyle(element, null)
      expect(element.style.cssText).toBe('')

      setElementStyle(element, undefined)
      expect(element.style.cssText).toBe('')
    })

    test('handles empty object styles', () => {
      setElementStyle(element, {})
      expect(element.style.cssText).toBe('')
    })
  })

  describe('classNamesMatch', () => {
    test('matches identical strings', () => {
      expect(classNamesMatch('foo bar', 'foo bar')).toBe(true)
      expect(classNamesMatch('', '')).toBe(true)
    })

    test('matches regardless of order', () => {
      expect(classNamesMatch('foo bar baz', 'baz bar foo')).toBe(true)
      expect(classNamesMatch('a b c d', 'd c b a')).toBe(true)
    })

    test('matches with different whitespace', () => {
      expect(classNamesMatch('foo  bar', 'foo bar')).toBe(true)
      expect(classNamesMatch('  foo bar  ', 'foo bar')).toBe(true)
      expect(classNamesMatch('foo\tbar', 'foo bar')).toBe(true)
    })

    test('detects mismatches', () => {
      expect(classNamesMatch('foo bar', 'foo baz')).toBe(false)
      expect(classNamesMatch('foo', 'foo bar')).toBe(false)
      expect(classNamesMatch('foo bar', 'foo')).toBe(false)
    })

    test('handles duplicates correctly', () => {
      expect(classNamesMatch('foo foo bar', 'foo bar')).toBe(false)
      expect(classNamesMatch('foo bar', 'foo foo bar')).toBe(false)
    })
  })

  describe('applyElementProps', () => {
    test('applies className', () => {
      applyElementProps(element, { className: 'test-class' })
      expect(element.className).toBe('test-class')
    })

    test('applies style object', () => {
      applyElementProps(element, { style: { color: 'red' } })
      expect(element.style.color).toBe('red')
    })

    test('applies style string', () => {
      applyElementProps(element, { style: 'color: blue;' })
      expect(element.style.color).toBe('blue')
    })

    test('applies id attribute', () => {
      applyElementProps(element, { id: 'test-id' })
      expect(element.getAttribute('id')).toBe('test-id')
    })

    test('applies data attributes', () => {
      applyElementProps(element, {
        'data-test': 'value',
        'data-foo': 'bar'
      })
      expect(element.getAttribute('data-test')).toBe('value')
      expect(element.getAttribute('data-foo')).toBe('bar')
    })

    test('ignores special props', () => {
      const mockFn = () => {}
      applyElementProps(element, {
        children: 'ignored',
        key: 'ignored',
        ref: 'ignored',
        onClick: mockFn
      })
      expect(element.textContent).toBe('')
      expect((element as any).key).toBeUndefined()
      expect((element as any).ref).toBeUndefined()
      expect((element as any).onClick).toBeUndefined()
    })

    test('applies regular DOM properties', () => {
      const input = document.createElement('input')
      applyElementProps(input, {
        value: 'test',
        disabled: true,
        type: 'email'
      })
      expect(input.value).toBe('test')
      expect(input.disabled).toBe(true)
      expect(input.type).toBe('email')
    })

    test('handles null/undefined props', () => {
      applyElementProps(element, null as any)
      expect(element.className).toBe('')

      applyElementProps(element, undefined as any)
      expect(element.className).toBe('')
    })

    test('handles props with null values', () => {
      applyElementProps(element, {
        className: null,
        style: null,
        id: null
      })
      expect(element.className).toBe('')
      expect(element.style.cssText).toBe('')
      expect(element.getAttribute('id')).toBeNull()
    })
  })

  describe('updateElementProps', () => {
    test('updates className only when different', () => {
      element.className = 'old-class'
      updateElementProps(element, { className: 'old-class' })
      expect(element.className).toBe('old-class')

      updateElementProps(element, { className: 'new-class' })
      expect(element.className).toBe('new-class')
    })

    test('preserves className when logically equivalent', () => {
      element.className = 'foo bar'
      const originalElement = element

      updateElementProps(element, { className: 'bar foo' })
      expect(element).toBe(originalElement)
      expect(element.className).toBe('foo bar')
    })

    test('updates style', () => {
      element.style.color = 'red'
      updateElementProps(element, { style: { backgroundColor: 'blue' } })
      expect(element.style.backgroundColor).toBe('blue')
    })

    test('updates id attribute', () => {
      element.setAttribute('id', 'old-id')
      updateElementProps(element, { id: 'new-id' })
      expect(element.getAttribute('id')).toBe('new-id')
    })

    test('updates data attributes', () => {
      element.setAttribute('data-test', 'old')
      updateElementProps(element, { 'data-test': 'new' })
      expect(element.getAttribute('data-test')).toBe('new')
    })

    test('ignores special props during update', () => {
      updateElementProps(element, {
        children: 'ignored',
        key: 'ignored',
        ref: 'ignored',
        onClick: () => {}
      })
      expect(element.textContent).toBe('')
    })

    test('updates regular DOM properties', () => {
      const input = document.createElement('input')
      input.value = 'old'
      input.disabled = false

      updateElementProps(input, {
        value: 'new',
        disabled: true
      })
      expect(input.value).toBe('new')
      expect(input.disabled).toBe(true)
    })

    test('handles empty props object', () => {
      element.className = 'test'
      updateElementProps(element, {})
      expect(element.className).toBe('test')
    })
  })
})