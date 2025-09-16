import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushAnimationFrame, flushMicrotasks } from '../../../../test/utils'
import * as contextModule from '../../../hooks/internal/context'
import * as effectUtils from '../../../hooks/internal/effect-utils'
import * as renderModule from '../../../hooks/internal/render'
import type { HookInstance } from '../../../hooks/internal/types'
import { clearUpdateQueue, deleteUpdateQueue, scheduleUpdate } from '../../../hooks/internal/update-queue'
import type { HookContext } from '../../../types'

const createInstance = (): HookInstance => ({
  component: vi.fn(() => ({ type: 'div', props: {}, children: [] }) as any),
  props: { value: 1 },
  state: { hooks: [], renderCount: 0 },
  mounted: true,
  unmounted: false,
  scheduleUpdate: vi.fn(),
})

beforeEach(() => {
  vi.spyOn(contextModule, 'setHookContext')
  vi.spyOn(effectUtils, 'runEffects')
  vi.spyOn(renderModule, 'rerenderWithHooks')
})

afterEach(() => {
  vi.restoreAllMocks()
  clearUpdateQueue()
})

describe('update queue', () => {
  it('flushes scheduled updates for mounted instances', async () => {
    const instance = createInstance()
    instance.container = document.createElement('div')

    scheduleUpdate(instance)
    await flushMicrotasks()

    expect(instance.component).toHaveBeenCalledTimes(1)
    expect(instance.state.renderCount).toBe(1)
    expect(renderModule.rerenderWithHooks).toHaveBeenCalledWith(instance.container, instance.vnode)

    await flushAnimationFrame()
    expect(effectUtils.runEffects).toHaveBeenCalledTimes(1)
    const runEffectsSpy = vi.mocked(effectUtils.runEffects)
    const contextArg = runEffectsSpy.mock.calls[0]?.[0] as HookContext
    expect(contextArg.component).toBe(instance)
  })

  it('removes instances from the queue when deleteUpdateQueue is called', async () => {
    const instance = createInstance()

    scheduleUpdate(instance)
    const deleted = deleteUpdateQueue(instance)
    expect(deleted).toBe(true)

    await flushMicrotasks()
    expect(instance.component).not.toHaveBeenCalled()
  })

  it('skips updates for unmounted instances and clears the queue', async () => {
    const instance = createInstance()
    instance.mounted = false

    scheduleUpdate(instance)
    await flushMicrotasks()

    expect(instance.component).not.toHaveBeenCalled()

    instance.mounted = true
    instance.unmounted = true
    scheduleUpdate(instance)
    await flushMicrotasks()
    expect(instance.component).not.toHaveBeenCalled()
  })

  it('clears the queue explicitly', async () => {
    const first = createInstance()
    const second = createInstance()

    scheduleUpdate(first)
    scheduleUpdate(second)
    clearUpdateQueue()

    await flushMicrotasks()
    expect(first.component).not.toHaveBeenCalled()
    expect(second.component).not.toHaveBeenCalled()
  })
})
