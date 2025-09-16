import { afterEach, describe, expect, it, vi } from 'vitest'
import { createTestContainer } from '../../test/utils'
import { createContext } from '../context/create-context'
import * as contextInternal from '../context/internal'
import { readContextValue } from '../context/internal'
import * as eventManager from '../event-manager'
import * as hooksInternal from '../hooks/internal'
import { Fragment, jsx } from '../jsx-runtime'
import { __renderInternals, render } from '../render'

afterEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

describe('render', () => {
  it('requires a root element', () => {
    expect(() => render(null as any, 'value' as any)).toThrowError('Render root element is required')
  })

  it('cleans up existing content and renders text nodes', () => {
    const root = createTestContainer()
    const previous = document.createElement('div')
    const unmount = vi.fn()
    ;(previous as any).__component = { unmount }
    root.appendChild(previous)

    const cleanupHost = vi.spyOn(hooksInternal, 'cleanupHostInstance')
    const cleanupEvents = vi.spyOn(eventManager, 'cleanupEvents')
    const setupEvents = vi.spyOn(eventManager, 'setupEventDelegation')

    const result = (render as any)(root, 'hello world')

    expect(result).toBeUndefined()
    expect(cleanupHost).toHaveBeenCalled()
    expect(unmount).toHaveBeenCalledTimes(1)
    expect(cleanupEvents).toHaveBeenCalledWith(root)
    expect(setupEvents).toHaveBeenCalledWith(root)
    expect(root.textContent).toBe('hello world')
  })

  it('renders numeric children as text nodes', () => {
    const root = createTestContainer()

    render(root, 42 as any)

    expect(root.textContent).toBe('42')
  })

  it('ignores values that are not valid vnodes', () => {
    const root = createTestContainer()

    const result = (render as any)(root, { invalid: true })

    expect(result).toBeNull()
    expect(root.childNodes).toHaveLength(0)
  })

  it('ignores nullish children', () => {
    const root = createTestContainer()

    const result = (render as any)(root, null)

    expect(result).toBeNull()
    expect(root.childNodes).toHaveLength(0)
  })

  it('renders element vnodes and delegates events', () => {
    const root = createTestContainer()
    const handler = vi.fn()

    render(
      root,
      jsx(
        'button',
        { onClick: handler, className: 'btn', id: 'primary', 'data-role': 'cta' },
        'Click',
        jsx('span', null, 'child')
      )
    )

    const button = root.querySelector('button') as HTMLButtonElement
    expect(button).toBeTruthy()
    expect(button.id).toBe('primary')
    expect(button.dataset.role).toBe('cta')

    button.dispatchEvent(new Event('click', { bubbles: true }))
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('renders fragments and nested children', () => {
    const root = createTestContainer()

    render(root, jsx(Fragment, null, 'a', 'b'))

    expect(root.textContent).toBe('ab')
  })

  it('supports function components with context providers', () => {
    const root = createTestContainer()
    const ValueContext = createContext('default')
    const enterSpy = vi.spyOn(contextInternal, 'enterContextProvider')
    const exitSpy = vi.spyOn(contextInternal, 'exitContextProvider')

    const Consumer = () => ({
      type: 'span',
      props: {},
      children: [readContextValue(ValueContext)],
      key: undefined,
    })

    const consumerVNode = {
      type: Consumer,
      props: {},
      children: [],
      key: undefined,
    }

    const providerVNode = {
      type: ValueContext.Provider,
      props: { value: 'provided', children: consumerVNode },
      children: [consumerVNode],
      key: undefined,
    }

    render(root, providerVNode as any)

    expect(root.textContent).toBe('provided')
    expect(enterSpy).toHaveBeenCalledWith(ValueContext, 'provided')
    expect(exitSpy).toHaveBeenCalled()
    enterSpy.mockRestore()
    exitSpy.mockRestore()
  })

  it('uses context default value when provider value is undefined', () => {
    const root = createTestContainer()
    const ValueContext = createContext('fallback')
    const enterSpy = vi.spyOn(contextInternal, 'enterContextProvider')
    const exitSpy = vi.spyOn(contextInternal, 'exitContextProvider')

    const Consumer = () => ({
      type: 'span',
      props: {},
      children: [readContextValue(ValueContext)],
      key: undefined,
    })

    const consumerVNode = {
      type: Consumer,
      props: {},
      children: [],
      key: undefined,
    }

    const providerVNode = {
      type: ValueContext.Provider,
      props: { children: consumerVNode },
      children: [consumerVNode],
      key: undefined,
    }

    render(root, providerVNode as any)

    expect(root.textContent).toBe('fallback')
    expect(enterSpy).toHaveBeenCalledWith(ValueContext, 'fallback')
    expect(exitSpy).toHaveBeenCalled()
    enterSpy.mockRestore()
    exitSpy.mockRestore()
  })

  it('rethrows component errors after logging', () => {
    const root = createTestContainer()
    const error = new Error('boom')
    const logger = vi.spyOn(console, 'error').mockImplementation(() => {
      /* noop */
    })

    const Problem = () => {
      throw error
    }

    const vnode = {
      type: Problem,
      props: {},
      children: [],
      key: undefined,
    }

    expect(() => render(root, vnode as any)).toThrowError(error)
    expect(logger).toHaveBeenCalledWith('Functional component render error:', error)
    logger.mockRestore()
  })
})

describe('render internals', () => {
  it('creates DOM elements with styles and attributes from vnodes', () => {
    const vnode = {
      type: 'div',
      props: { className: 'box', style: 'color: purple;', id: 'node', 'data-role': 'demo' },
      children: ['text'],
      key: undefined,
    }

    const element = __renderInternals.createElementFromVNode(vnode as any) as HTMLElement
    expect(element.className).toBe('box')
    expect(element.getAttribute('style')).toContain('color: purple')
    expect(element.getAttribute('data-role')).toBe('demo')
    expect(element.textContent).toBe('text')
  })

  it('uses default provider values when none are supplied', () => {
    const ValueContext = createContext('default')
    const child = { type: 'span', props: {}, children: ['value'], key: undefined }

    const enterSpy = vi.spyOn(contextInternal, 'enterContextProvider')
    const exitSpy = vi.spyOn(contextInternal, 'exitContextProvider')

    const vnode = {
      type: ValueContext.Provider,
      props: { children: child },
      children: [child],
      key: undefined,
    }

    const rendered = __renderInternals.createFunctionElement(vnode as any)
    expect(rendered).toBeInstanceOf(Element)
    expect(enterSpy).toHaveBeenCalledWith(ValueContext, 'default')
    expect(exitSpy).toHaveBeenCalledTimes(1)
    enterSpy.mockRestore()
    exitSpy.mockRestore()
  })

  it('passes explicit provider values to context internals', () => {
    const ValueContext = createContext('default')
    const child = { type: 'span', props: {}, children: ['value'], key: undefined }

    const enterSpy = vi.spyOn(contextInternal, 'enterContextProvider')
    const exitSpy = vi.spyOn(contextInternal, 'exitContextProvider')

    const vnode = {
      type: ValueContext.Provider,
      props: { value: 'custom', children: child },
      children: [child],
      key: undefined,
    }

    const rendered = __renderInternals.createFunctionElement(vnode as any)
    expect(rendered).toBeInstanceOf(Element)
    expect(enterSpy).toHaveBeenCalledWith(ValueContext, 'custom')
    expect(exitSpy).toHaveBeenCalledTimes(1)
    enterSpy.mockRestore()
    exitSpy.mockRestore()
  })

  it('uses default provider values when none are supplied', () => {
    const ValueContext = createContext('default')
    const child = { type: 'span', props: {}, children: ['value'], key: undefined }

    const enterSpy = vi.spyOn(contextInternal, 'enterContextProvider')
    const exitSpy = vi.spyOn(contextInternal, 'exitContextProvider')

    const vnode = {
      type: ValueContext.Provider,
      props: undefined,
      children: [child],
      key: undefined,
    }

    const rendered = __renderInternals.createFunctionElement(vnode as any)
    expect(rendered).toBeInstanceOf(Element)
    expect(enterSpy).toHaveBeenCalledWith(ValueContext, 'default')
    expect(exitSpy).toHaveBeenCalledTimes(1)
    enterSpy.mockRestore()
    exitSpy.mockRestore()
  })

  it('logs and rethrows errors from functional components', () => {
    const Problem = () => {
      throw new Error('failure')
    }

    const vnode = {
      type: Problem,
      props: {},
      children: [],
      key: undefined,
    }

    const logger = vi.spyOn(console, 'error').mockImplementation(() => {
      /* noop */
    })

    expect(() => __renderInternals.createFunctionElement(vnode as any)).toThrowError('failure')
    expect(logger).toHaveBeenCalledWith('Functional component render error:', expect.any(Error))
    logger.mockRestore()
  })

  it('renders function components without context involvement', () => {
    const Component = () => ({
      type: 'span',
      props: { id: 'plain' },
      children: ['content'],
      key: undefined,
    })

    const vnode = {
      type: Component,
      props: {},
      children: [],
      key: undefined,
    }

    const element = __renderInternals.createFunctionElement(vnode as any)
    expect(element).toBeInstanceOf(Element)
    expect((element as HTMLElement).textContent).toBe('content')
    expect((element as HTMLElement).id).toBe('plain')
  })

  it('returns null for non-vnode values', () => {
    expect(__renderInternals.createElementFromVNode(null as any)).toBeNull()
    expect(__renderInternals.createElementFromVNode({} as any)).toBeNull()
  })
})
