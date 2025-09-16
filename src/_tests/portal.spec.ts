import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushAnimationFrame } from '../../test/utils'
import { withHooks } from '../hooks/internal'
import { jsx } from '../jsx-runtime'
import { Portal, createPortal } from '../portal'

const renderPortal = async (target: Element | string) => {
  const vnode = jsx('span', { id: 'portal-child' }, 'teleport')
  withHooks(Portal as any, { children: vnode, target })
  await flushAnimationFrame()
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('Portal', () => {
  it('renders children into the provided target element', async () => {
    const target = document.createElement('div')
    document.body.appendChild(target)

    await renderPortal(target)

    expect(target.textContent).toBe('teleport')
  })

  it('supports string selectors for portal targets', async () => {
    const target = document.createElement('div')
    target.id = 'portal-target'
    document.body.appendChild(target)

    await renderPortal('#portal-target')

    expect(target.textContent).toBe('teleport')
  })

  it('logs an error when the target cannot be found', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {
      /* noop */
    })

    await renderPortal('#missing')

    expect(error).toHaveBeenCalledWith('Portal target not found:', '#missing')
    error.mockRestore()
  })
})

describe('createPortal', () => {
  it('creates a portal vnode using jsx runtime', () => {
    const target = document.createElement('div')
    const vnode = createPortal(jsx('span', null, 'child'), target)

    expect(typeof vnode).toBe('object')
  })
})
