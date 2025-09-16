import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushAnimationFrame } from '../../../../test/utils'
import * as contextModule from '../../../hooks/internal/context'
import * as effectUtils from '../../../hooks/internal/effect-utils'
import type { HookInstance } from '../../../hooks/internal/types'
import * as updateQueue from '../../../hooks/internal/update-queue'
import { cleanupHostInstance, withHooks } from '../../../hooks/internal/with-hooks'

const originalWeakMapGet = WeakMap.prototype.get
const originalWeakMapDelete = WeakMap.prototype.delete

const createComponent = () =>
  vi.fn((props: Record<string, unknown>) => ({
    type: 'div',
    props,
    children: [],
  }))

describe('withHooks', () => {
  beforeEach(() => {
    vi.spyOn(contextModule, 'setHookContext')
    vi.spyOn(effectUtils, 'runEffects').mockImplementation(() => {
      /* noop */
    })
    vi.spyOn(updateQueue, 'scheduleUpdate')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('creates a hook instance, renders the component, and schedules effects', async () => {
    const component = createComponent()

    const vnode = withHooks(component as any, { foo: 'bar' })

    expect(component).toHaveBeenCalledWith({ foo: 'bar' })
    expect(contextModule.setHookContext).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ component: expect.any(Object) })
    )
    expect(contextModule.setHookContext).toHaveBeenLastCalledWith(null)

    const host = (vnode as any).__hookHost as HookInstance
    expect(host).toBeDefined()
    expect(host.state.renderCount).toBe(1)
    expect(host.mounted).toBe(false)

    host.scheduleUpdate()
    expect(updateQueue.scheduleUpdate).toHaveBeenCalledWith(host)

    await flushAnimationFrame()
    expect(effectUtils.runEffects).toHaveBeenCalledWith(expect.objectContaining({ component: host }))
    expect(host.mounted).toBe(true)
  })
})

describe('cleanupHostInstance', () => {
  beforeEach(() => {
    vi.spyOn(updateQueue, 'deleteUpdateQueue').mockReturnValue(true)
    vi.spyOn(effectUtils, 'cleanupEffects').mockImplementation(() => {
      /* noop */
    })
  })

  afterEach(() => {
    WeakMap.prototype.get = originalWeakMapGet
    WeakMap.prototype.delete = originalWeakMapDelete
    vi.restoreAllMocks()
  })

  it('cleans up stored hook instances and recurses into descendants', () => {
    const container = document.createElement('div')
    const child = document.createElement('span')
    container.appendChild(child)

    const instance: HookInstance = {
      component: vi.fn(),
      props: {},
      state: { hooks: [], renderCount: 1 },
      mounted: true,
      unmounted: false,
      scheduleUpdate: vi.fn(),
    }

    let trackedMap: WeakMap<Element, HookInstance> | null = null

    const getSpy = vi.spyOn(WeakMap.prototype, 'get').mockImplementation(function (
      this: WeakMap<Element, HookInstance>,
      key: Element
    ) {
      if (!trackedMap) trackedMap = this
      if (this === trackedMap && key === container) {
        return instance
      }
      return originalWeakMapGet.call(this, key)
    })

    const deleteSpy = vi.spyOn(WeakMap.prototype, 'delete').mockImplementation(function (
      this: WeakMap<Element, HookInstance>,
      key: Element
    ) {
      if (this === trackedMap && key === container) {
        return true
      }
      return originalWeakMapDelete.call(this, key)
    })

    cleanupHostInstance(container)

    expect(instance.unmounted).toBe(true)
    expect(updateQueue.deleteUpdateQueue).toHaveBeenCalledWith(instance)
    expect(effectUtils.cleanupEffects).toHaveBeenCalledWith(
      expect.objectContaining({ component: instance, hooks: instance.state.hooks })
    )
    expect(deleteSpy).toHaveBeenCalled()
    expect(getSpy).toHaveBeenCalled()
  })
})
