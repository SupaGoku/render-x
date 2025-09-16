import { beforeEach, describe, expect, it, vi } from 'vitest'
import { applyElementProps, classNamesMatch, setElementStyle, updateElementProps } from '../dom-props'
import * as events from '../event-manager'

let element: HTMLElement

beforeEach(() => {
  element = document.createElement('div')
})

describe('classNamesMatch', () => {
  it('returns true when class lists match regardless of order and spacing', () => {
    expect(classNamesMatch('foo  bar', 'bar foo')).toBe(true)
  })

  it('returns false when class lists differ', () => {
    expect(classNamesMatch('foo', 'foo bar')).toBe(false)
  })

  it('returns true immediately when class names are identical strings', () => {
    expect(classNamesMatch('same', 'same')).toBe(true)
  })

  it('detects mismatched class tokens with equal lengths', () => {
    expect(classNamesMatch('foo bar', 'foo baz')).toBe(false)
  })
})

describe('setElementStyle', () => {
  it('applies string styles to an element', () => {
    setElementStyle(element, 'color: green;')
    expect(element.getAttribute('style')).toContain('color: green')
  })

  it('merges object styles onto an element', () => {
    const assign = vi.spyOn(Object, 'assign')
    setElementStyle(element, { border: '1px solid red' })
    expect(assign).toHaveBeenCalledWith(element.style, { border: '1px solid red' })
    assign.mockRestore()
  })
})

describe('applyElementProps', () => {
  it('registers event handlers only during initial assignment', () => {
    const handler = vi.fn()
    const spy = vi.spyOn(events, 'registerEventHandler')
    const assign = vi.spyOn(Object, 'assign')

    applyElementProps(element, {
      onClick: handler,
      className: 'alpha beta',
      style: { color: 'red' },
      id: 'demo',
      'data-role': 'button',
      title: 'hello',
    })

    expect(spy).toHaveBeenCalledWith(element, 'onClick', handler)
    expect(element.className).toBe('alpha beta')
    expect(assign).toHaveBeenCalledWith(element.style, { color: 'red' })
    expect(element.id).toBe('demo')
    expect(element.getAttribute('data-role')).toBe('button')
    expect((element as any).title).toBe('hello')

    updateElementProps(element, {
      onClick: handler,
      className: 'beta alpha',
      style: 'background: blue;',
      'data-role': 'link',
      title: undefined,
    })

    expect(spy).toHaveBeenCalledTimes(1)
    expect(element.className).toBe('alpha beta')
    expect((element as HTMLElement).style.cssText).toContain('background: blue')
    expect(element.getAttribute('data-role')).toBe('link')
    expect((element as any).title).toBe('hello')

    updateElementProps(element, { className: 'beta alpha' })
    expect(element.className).toBe('alpha beta')

    updateElementProps(element, { className: 'gamma' })
    expect(element.className).toBe('gamma')

    updateElementProps(element, { className: 'gamma' })
    expect(element.className).toBe('gamma')

    assign.mockRestore()
  })

  it('ignores nullish values', () => {
    applyElementProps(element, { id: 'initial' })

    updateElementProps(element, { id: null as any })

    expect(element.id).toBe('initial')

    applyElementProps(element, { className: undefined as any })
    expect(element.className).toBe('')
  })

  it('handles nullish props without throwing', () => {
    expect(() => applyElementProps(element, null as any)).not.toThrow()
    expect(() => updateElementProps(element, undefined as any)).not.toThrow()
  })
})
