import { describe, expect, it } from 'vitest'
import { createPortal, h, Portal, render, useState } from '../../src'

describe('Portal', () => {
  it('renders content in target element', () => {
    document.body.innerHTML = `
      <div id="root"></div>
      <div id="portal-target"></div>
    `

    const root = document.getElementById('root')!
    const target = document.getElementById('portal-target')!

    render(root, h('div', null, createPortal(h('p', null, 'Portal content'), target)))

    expect(root.innerHTML).toBe('<div></div>')
    expect(target.innerHTML).toBe('<p>Portal content</p>')
  })

  it('works with Portal component', () => {
    document.body.innerHTML = `
      <div id="root"></div>
      <div id="portal-target"></div>
    `

    const root = document.getElementById('root')!
    const target = document.getElementById('portal-target')!

    render(root, h(Portal, { target }, h('span', null, 'Via component')))

    expect(target.innerHTML).toBe('<span>Via component</span>')
  })

  it('supports CSS selector for target', () => {
    document.body.innerHTML = `
      <div id="root"></div>
      <div class="my-target"></div>
    `

    const root = document.getElementById('root')!

    render(root, h(Portal, { target: '.my-target' }, h('div', null, 'Selector works')))

    const target = document.querySelector('.my-target')!
    expect(target.innerHTML).toBe('<div>Selector works</div>')
  })

  it('updates portal content on re-render', async () => {
    document.body.innerHTML = `
      <div id="root"></div>
      <div id="portal-target"></div>
    `

    const root = document.getElementById('root')!
    const target = document.getElementById('portal-target')!

    let setText: any

    const App = () => {
      const [text, setTextState] = useState('Initial')
      setText = setTextState
      return h('div', null, createPortal(h('p', null, text), target))
    }

    render(root, h(App, null))
    expect(target.innerHTML).toBe('<p>Initial</p>')

    // Trigger state update
    setText('Updated')

    // Wait for update to process
    await new Promise(resolve => setTimeout(resolve, 10))
    expect(target.innerHTML).toBe('<p>Updated</p>')
  })

  it('cleans up portal content when removed', async () => {
    document.body.innerHTML = `
      <div id="root"></div>
      <div id="portal-target"></div>
    `

    const root = document.getElementById('root')!
    const target = document.getElementById('portal-target')!

    let setShowPortal: any

    const App = () => {
      const [showPortal, setPortalState] = useState(true)
      setShowPortal = setPortalState
      return h('div', null, showPortal ? createPortal(h('p', null, 'Content'), target) : 'No portal')
    }

    render(root, h(App, null))
    expect(target.innerHTML).toBe('<p>Content</p>')

    // Hide portal
    setShowPortal(false)

    // Wait for update to process
    await new Promise(resolve => setTimeout(resolve, 10))
    expect(target.innerHTML).toBe('')
  })

  it('handles multiple children in portal', () => {
    document.body.innerHTML = `
      <div id="root"></div>
      <div id="portal-target"></div>
    `

    const root = document.getElementById('root')!
    const target = document.getElementById('portal-target')!

    render(
      root,
      h(
        'div',
        null,
        createPortal([h('span', null, 'One'), h('span', null, 'Two'), h('span', null, 'Three')], target)
      )
    )

    expect(target.innerHTML).toBe('<span>One</span><span>Two</span><span>Three</span>')
  })

  it('maintains tree structure for context', () => {
    document.body.innerHTML = `
      <div id="root"></div>
      <div id="portal-target"></div>
    `

    const root = document.getElementById('root')!
    const target = document.getElementById('portal-target')!

    const App = () => {
      return h('div', null, h(Portal, { target }, h('div', { id: 'portal-child' }, 'In portal')))
    }

    render(root, h(App, null))

    const portalChild = target.querySelector('#portal-child')
    expect(portalChild).toBeTruthy()
    expect(portalChild?.textContent).toBe('In portal')
  })
})