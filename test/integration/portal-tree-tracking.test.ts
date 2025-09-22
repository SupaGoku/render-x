import { describe, expect, it } from 'vitest'
import { createPortal, h, render } from '../../src'
import { isPortalNode, PortalNode } from '../../src/portal'
import { getPortalOriginContext, isPortalDescendantOf } from '../../src/portal-utils'
import { RenderXNode } from '../../src/types'

describe('Portal Tree Tracking', () => {
  it('tracks portal parent in tree hierarchy', () => {
    document.body.innerHTML = `
      <div id="root"></div>
      <div id="portal-target"></div>
    `

    const root = document.getElementById('root')!
    const target = document.getElementById('portal-target')!

    let capturedPortal: RenderXNode

    const Component = () => {
      const portal = createPortal(h('p', null, 'Portal content'), target)
      capturedPortal = portal
      return h('div', { id: 'parent' }, portal)
    }

    render(root, h(Component, null))

    // @ts-expect-error
    if (!capturedPortal) throw new Error('Captured portal is null')

    expect(capturedPortal).not.toBeNull()
    if (isPortalNode(capturedPortal!)) {
      expect(capturedPortal!.treeParent).not.toBeNull()
      expect(capturedPortal!.treeParent?.props?.id).toBe('parent')
    }
  })

  it('provides correct origin context for portals', () => {
    document.body.innerHTML = `
      <div id="root"></div>
      <div id="portal-target"></div>
    `

    const root = document.getElementById('root')!
    const target = document.getElementById('portal-target')!

    let capturedPortal: RenderXNode | null = null

    const Component = () => {
      const portal = createPortal(h('span', null, 'Test'), target)
      capturedPortal = portal
      return h('article', { className: 'wrapper' }, portal)
    }

    render(root, h(Component, null))

    if (isPortalNode(capturedPortal!)) {
      const origin = getPortalOriginContext(capturedPortal!)
      expect(origin).not.toBeNull()
      expect(origin?.props?.className).toBe('wrapper')
    }
  })

  it('correctly determines portal ancestry', () => {
    document.body.innerHTML = `
      <div id="root"></div>
      <div id="portal-target"></div>
    `

    const root = document.getElementById('root')!
    const target = document.getElementById('portal-target')!

    let capturedPortal: PortalNode

    const Component = () => {
      const portal = createPortal(h('div', null, 'Portal'), target)
      capturedPortal = portal

      return h('section', { id: 'ancestor' }, portal)
    }

    render(root, h(Component, null))

    // @ts-expect-error
    if (!capturedPortal) throw new Error('Captured portal is null')

    if (isPortalNode(capturedPortal!)) {
      const parent = capturedPortal!.treeParent
      expect(parent).not.toBeNull()
      expect(parent?.props?.id).toBe('ancestor')

      const isDescendant = isPortalDescendantOf(capturedPortal!, parent!)
      expect(isDescendant).toBe(true)
    }
  })
})
