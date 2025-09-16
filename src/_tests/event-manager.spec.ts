import { describe, expect, it, vi } from 'vitest'
import { createTestContainer } from '../../test/utils'
import { cleanupEvents, registerEventHandler, setupEventDelegation } from '../event-manager'

describe('event-manager', () => {
  it('delegates events to registered handlers and supports cleanup', () => {
    const root = createTestContainer()
    const button = document.createElement('button')
    root.appendChild(button)

    const clickHandler = vi.fn()
    registerEventHandler(button, 'onClick', clickHandler)

    setupEventDelegation(root)

    button.dispatchEvent(new Event('click', { bubbles: true }))
    expect(clickHandler).toHaveBeenCalledTimes(1)

    cleanupEvents(root)

    button.dispatchEvent(new Event('click', { bubbles: true }))
    expect(clickHandler).toHaveBeenCalledTimes(1)
  })

  it('ignores roots without registered handlers', () => {
    const root = createTestContainer()
    expect(() => setupEventDelegation(root)).not.toThrow()
  })

  it('walks up the DOM tree to locate delegated handlers', () => {
    const root = createTestContainer()
    const parent = document.createElement('div')
    const child = document.createElement('span')
    parent.appendChild(child)
    root.appendChild(parent)

    const clickHandler = vi.fn()
    registerEventHandler(parent, 'onClick', clickHandler)

    setupEventDelegation(root)

    child.dispatchEvent(new Event('click', { bubbles: true }))
    expect(clickHandler).toHaveBeenCalledTimes(1)
  })
})
