import { afterEach, describe, expect, it, vi } from 'vitest'
import { createTestContainer } from '../../../../test/utils'
import { createContext } from '../../../context/create-context'
import * as contextInternal from '../../../context/internal'
import { __hookRenderInternals, rerenderWithHooks } from '../../../hooks/internal/render'
import type { HookInstance } from '../../../hooks/internal/types'

afterEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

describe('rerenderWithHooks', () => {
  it('returns early when the container is detached', () => {
    const detached = document.createElement('div')
    rerenderWithHooks(detached, { type: 'div', props: {}, children: [] } as any)
    expect(detached.childNodes).toHaveLength(0)
  })

  it('updates attributes, text nodes, and child elements', () => {
    const root = createTestContainer()
    const container = document.createElement('div')
    root.appendChild(container)

    rerenderWithHooks(container, {
      type: 'div',
      props: { className: 'initial', style: 'color: blue;' },
      children: ['first'],
    } as any)

    expect(container.className).toBe('initial')
    expect(container.textContent).toBe('first')
    expect(container.getAttribute('style')).toContain('color: blue')

    const assign = vi.spyOn(Object, 'assign')
    rerenderWithHooks(container, {
      type: 'div',
      props: {
        className: 'updated',
        style: { color: 'red' },
        id: 'node',
        'data-role': 'demo',
        customProp: 'value',
      },
      children: ['second', { type: 'span', props: { id: 'child', className: 'nested' }, children: ['child'] }, true],
    } as any)

    expect(container.className).toBe('updated')
    expect(container.id).toBe('node')
    expect(container.getAttribute('data-role')).toBe('demo')
    expect(container.textContent).toContain('second')
    expect(assign).toHaveBeenCalledWith(expect.anything(), { color: 'red' })
    const span = container.querySelector('span') as HTMLSpanElement | null
    if (span) {
      expect(span.id).toBe('child')
      expect(span.className).toBe('nested')
    }
    expect((container as any).customProp).toBe('value')
    expect(Array.from(container.childNodes).some((node) => node.textContent === 'true')).toBe(false)
    assign.mockRestore()
  })

  it('activates context providers when functional children are encountered', () => {
    const root = createTestContainer()
    const container = document.createElement('div')
    root.appendChild(container)

    const context = createContext('default')
    const enterSpy = vi.spyOn(contextInternal, 'enterContextProvider')
    const exitSpy = vi.spyOn(contextInternal, 'exitContextProvider')

    rerenderWithHooks(container, {
      type: 'div',
      props: {},
      children: [
        {
          type: context.Provider,
          props: { value: 'override', children: { type: 'span', props: {}, children: ['child'] } },
          children: [],
        },
      ],
    } as any)

    expect(enterSpy).toHaveBeenCalledTimes(1)
    expect(exitSpy).toHaveBeenCalledTimes(1)
    expect(container.textContent).toContain('child')

    container.innerHTML = ''

    rerenderWithHooks(container, {
      type: 'div',
      props: {},
      children: [
        {
          type: context.Provider,
          props: { children: { type: 'span', props: {}, children: ['fallback'] } },
          children: [],
        },
      ],
    } as any)

    expect(enterSpy).toHaveBeenCalledTimes(2)
    expect(exitSpy).toHaveBeenCalledTimes(2)
    expect(enterSpy.mock.calls[1][1]).toBe(context.defaultValue)
    expect(container.textContent).toContain('fallback')
  })

  it('attaches hook hosts to created elements', () => {
    const root = createTestContainer()
    const container = document.createElement('div')
    root.appendChild(container)

    const host: HookInstance = {
      component: vi.fn(),
      props: {},
      state: { hooks: [], renderCount: 0 },
      mounted: false,
      unmounted: false,
      scheduleUpdate: vi.fn(),
    }

    rerenderWithHooks(container, {
      type: 'div',
      props: {},
      children: [
        {
          type: 'span',
          props: {},
          children: [],
          __hookHost: host,
        },
      ],
    } as any)

    expect(host.container).toBeInstanceOf(Element)
  })

  it('renders function component children when updating elements', () => {
    const root = createTestContainer()
    const container = document.createElement('div')
    root.appendChild(container)

    const Child = () => ({ type: 'span', props: {}, children: ['fn-child'], key: undefined })

    rerenderWithHooks(container, {
      type: 'div',
      props: {},
      children: [{ type: Child, props: {}, children: [] }],
    } as any)

    expect(container.textContent).toContain('fn-child')
  })
})

describe('hook render internals', () => {
  it('creates elements with string and object styles', () => {
    const vnodeWithStringStyle = {
      type: 'div',
      props: { style: 'color: teal;' },
      children: [],
      key: undefined,
    }

    const stringStyled = __hookRenderInternals.createElementFromVNode(vnodeWithStringStyle) as HTMLElement
    expect(stringStyled.getAttribute('style')).toContain('color: teal')

    const vnodeWithObjectStyle = {
      type: 'div',
      props: { style: { background: 'black' } },
      children: [],
      key: undefined,
    }

    const assign = vi.spyOn(Object, 'assign')
    __hookRenderInternals.createElementFromVNode(vnodeWithObjectStyle)
    expect(assign).toHaveBeenCalledWith(expect.anything(), { background: 'black' })
    assign.mockRestore()
  })

  it('registers event listeners and data attributes', () => {
    const handler = vi.fn()
    const vnode = {
      type: 'button',
      props: { onClick: handler, 'data-id': 'btn', title: 'hello' },
      children: [],
      key: undefined,
    }

    const element = __hookRenderInternals.createElementFromVNode(vnode) as HTMLButtonElement
    expect(element.getAttribute('data-id')).toBe('btn')
    expect(element.title).toBe('hello')

    element.dispatchEvent(new Event('click'))
    expect(handler).toHaveBeenCalled()
  })

  it('updates existing elements when primitive vnodes change', () => {
    const element = document.createElement('div')
    element.textContent = 'old'

    __hookRenderInternals.updateElement(element, 'new')
    expect(element.textContent).toBe('new')

    __hookRenderInternals.updateElement(element, null)
    expect(element.textContent).toBe('new')
  })

  it('reconciles child collections by appending, updating, and removing nodes', () => {
    const parent = document.createElement('div')

    __hookRenderInternals.updateElementChildren(parent, ['first'])
    expect(parent.textContent).toBe('first')

    __hookRenderInternals.updateElementChildren(parent, ['second'])
    expect(parent.textContent).toBe('second')

    const childElement = document.createElement('span')
    childElement.textContent = 'third'
    parent.appendChild(childElement)

    __hookRenderInternals.updateElementChildren(parent, ['third', null])
    expect(parent.childNodes).toHaveLength(1)
    expect(parent.textContent).toBe('third')

    __hookRenderInternals.updateElementChildren(parent, [])
    expect(parent.childNodes).toHaveLength(0)

    const elementParent = document.createElement('div')
    const existingElement = document.createElement('span')
    existingElement.textContent = 'old'
    elementParent.appendChild(existingElement)

    __hookRenderInternals.updateElementChildren(elementParent, [
      { type: 'span', props: { className: 'updated' }, children: ['new'] },
    ])

    const updated = elementParent.querySelector('span') as HTMLSpanElement
    expect(updated.className).toBe('updated')
    expect(updated.textContent).toBe('new')
  })

  it('returns null for unsupported vnode values', () => {
    expect(__hookRenderInternals.createElementFromVNode(undefined)).toBeNull()
  })
})
