import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, h, useCallback, useState, unmount } from '../../../src'

describe('useCallback', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    unmount(container)
    container.remove()
  })

  test('memoizes callback function', async () => {
    let callbacks: any[] = []

    const Component = () => {
      const [count, setCount] = useState(0)
      const [other, setOther] = useState(0)

      const callback = useCallback(() => count * 2, [count])
      callbacks.push(callback)

      return h('div', null,
        h('span', null, `Count: ${count}, Other: ${other}, Result: ${callback()}`),
        h('button', { id: 'inc-count', onClick: () => setCount(count + 1) }, 'Inc Count'),
        h('button', { id: 'inc-other', onClick: () => setOther(other + 1) }, 'Inc Other')
      )
    }

    render(container, h(Component, null))
    expect(callbacks.length).toBe(1)
    expect(callbacks[0]()).toBe(0)

    // Changing unrelated state preserves callback
    const otherBtn = container.querySelector('#inc-other') as HTMLButtonElement
    otherBtn.click()
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(callbacks.length).toBe(2)
    expect(callbacks[1]).toBe(callbacks[0]) // Same function reference!
    expect(container.querySelector('span')?.textContent).toBe('Count: 0, Other: 1, Result: 0')

    // Changing dependent state creates new callback
    const countBtn = container.querySelector('#inc-count') as HTMLButtonElement
    countBtn.click()
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(callbacks.length).toBe(3)
    expect(callbacks[2]).not.toBe(callbacks[1]) // New function!
    expect(callbacks[2]()).toBe(2)
    expect(container.querySelector('span')?.textContent).toBe('Count: 1, Other: 1, Result: 2')
  })

  test.skip('works with empty dependency array', async () => {
    const mockHandler = vi.fn()
    let callbacks: any[] = []

    const Component = () => {
      const [count, setCount] = useState(0)

      const handleClick = useCallback(() => {
        mockHandler(count)
      }, [])

      callbacks.push(handleClick)

      return h('div', null,
        h('span', null, `Count: ${count}`),
        h('button', { id: 'inc', onClick: () => setCount(count + 1) }, 'Increment'),
        h('button', { id: 'test', onClick: handleClick }, 'Test Callback')
      )
    }

    render(container, h(Component, null))
    const testBtn = container.querySelector('#test') as HTMLButtonElement

    testBtn.click()
    expect(mockHandler).toHaveBeenCalledWith(0)
    expect(callbacks.length).toBe(1)

    const incBtn = container.querySelector('#inc') as HTMLButtonElement
    incBtn.click()
    await new Promise(resolve => setTimeout(resolve, 10))

    incBtn.click()
    await new Promise(resolve => setTimeout(resolve, 10))

    incBtn.click()
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(container.querySelector('span')?.textContent).toBe('Count: 3')
    expect(callbacks.length).toBe(4)

    // All callbacks should be the same reference
    expect(callbacks[1]).toBe(callbacks[0])
    expect(callbacks[2]).toBe(callbacks[0])
    expect(callbacks[3]).toBe(callbacks[0])

    // But the closure still captures initial value
    testBtn.click()
    expect(mockHandler).toHaveBeenCalledWith(0) // Still 0!
    expect(mockHandler).toHaveBeenCalledTimes(2)
  })

  test('preserves callback identity for event handlers', async () => {
    const mockHandler = vi.fn()
    let renderedCallbacks: any[] = []

    const Component = () => {
      const [multiplier, setMultiplier] = useState(1)
      const [clickCount, setClickCount] = useState(0)

      const handleClick = useCallback(() => {
        const result = multiplier * 10
        mockHandler(result)
        setClickCount(c => c + 1)
      }, [multiplier])

      renderedCallbacks.push(handleClick)

      return h('div', null,
        h('span', null, `Multiplier: ${multiplier}, Clicks: ${clickCount}`),
        h('button', { id: 'action', onClick: handleClick }, 'Action'),
        h('button', { id: 'inc-mult', onClick: () => setMultiplier(multiplier + 1) }, 'Inc Multiplier')
      )
    }

    render(container, h(Component, null))
    const actionBtn = container.querySelector('#action') as HTMLButtonElement

    actionBtn.click()
    await new Promise(resolve => setTimeout(resolve, 10))
    expect(mockHandler).toHaveBeenCalledWith(10)
    expect(container.querySelector('span')?.textContent).toBe('Multiplier: 1, Clicks: 1')

    // Clicking again uses the same callback
    actionBtn.click()
    await new Promise(resolve => setTimeout(resolve, 10))
    expect(mockHandler).toHaveBeenCalledWith(10)
    expect(renderedCallbacks[1]).toBe(renderedCallbacks[0])

    // Changing multiplier creates new callback
    const incMultBtn = container.querySelector('#inc-mult') as HTMLButtonElement
    incMultBtn.click()
    await new Promise(resolve => setTimeout(resolve, 10))

    actionBtn.click()
    await new Promise(resolve => setTimeout(resolve, 10))
    expect(mockHandler).toHaveBeenCalledWith(20)
    expect(renderedCallbacks[renderedCallbacks.length - 1]).not.toBe(renderedCallbacks[0])
  })

  test.skip('handles async callbacks', async () => {
    const fetchData = vi.fn(async (id: number) => {
      await new Promise(resolve => setTimeout(resolve, 5))
      return `Data for ${id}`
    })

    const Component = () => {
      const [id, setId] = useState(1)
      const [data, setData] = useState<string>('')
      const [loading, setLoading] = useState(false)

      const loadData = useCallback(async () => {
        setLoading(true)
        const result = await fetchData(id)
        setData(result)
        setLoading(false)
      }, [id])

      return h('div', null,
        h('p', null, loading ? 'Loading...' : (data || 'No data')),
        h('span', null, `Current ID: ${id}`),
        h('button', { id: 'load', onClick: loadData }, 'Load'),
        h('button', { id: 'next-id', onClick: () => setId(id + 1) }, 'Next ID')
      )
    }

    render(container, h(Component, null))
    expect(container.querySelector('p')?.textContent).toBe('No data')

    const loadBtn = container.querySelector('#load') as HTMLButtonElement
    loadBtn.click()

    // Check loading state
    await new Promise(resolve => setTimeout(resolve, 2))
    expect(container.querySelector('p')?.textContent).toBe('Loading...')

    // Wait for async operation
    await new Promise(resolve => setTimeout(resolve, 10))
    expect(container.querySelector('p')?.textContent).toBe('Data for 1')
    expect(fetchData).toHaveBeenCalledWith(1)
    expect(fetchData).toHaveBeenCalledTimes(1)

    // Change ID and load again
    const nextIdBtn = container.querySelector('#next-id') as HTMLButtonElement
    nextIdBtn.click()
    await new Promise(resolve => setTimeout(resolve, 10))

    loadBtn.click()
    await new Promise(resolve => setTimeout(resolve, 15))

    expect(container.querySelector('p')?.textContent).toBe('Data for 2')
    expect(fetchData).toHaveBeenCalledWith(2)
    expect(fetchData).toHaveBeenCalledTimes(2)
  })

  test('multiple useCallback hooks in same component', async () => {
    const handler1 = vi.fn()
    const handler2 = vi.fn()
    let callbacks1: any[] = []
    let callbacks2: any[] = []

    const Component = () => {
      const [a, setA] = useState(1)
      const [b, setB] = useState(2)

      const callback1 = useCallback(() => handler1(a), [a])
      const callback2 = useCallback(() => handler2(b), [b])

      callbacks1.push(callback1)
      callbacks2.push(callback2)

      return h('div', null,
        h('span', null, `A: ${a}, B: ${b}`),
        h('button', { id: 'test1', onClick: callback1 }, 'Test 1'),
        h('button', { id: 'test2', onClick: callback2 }, 'Test 2'),
        h('button', { id: 'inc-a', onClick: () => setA(a + 1) }, 'Inc A'),
        h('button', { id: 'inc-b', onClick: () => setB(b + 1) }, 'Inc B')
      )
    }

    render(container, h(Component, null))

    const test1Btn = container.querySelector('#test1') as HTMLButtonElement
    const test2Btn = container.querySelector('#test2') as HTMLButtonElement
    const incABtn = container.querySelector('#inc-a') as HTMLButtonElement
    const incBBtn = container.querySelector('#inc-b') as HTMLButtonElement

    test1Btn.click()
    test2Btn.click()
    expect(handler1).toHaveBeenCalledWith(1)
    expect(handler2).toHaveBeenCalledWith(2)

    // Incrementing A should only change callback1
    incABtn.click()
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(callbacks1[1]).not.toBe(callbacks1[0])
    expect(callbacks2[1]).toBe(callbacks2[0]) // callback2 unchanged

    test1Btn.click()
    test2Btn.click()
    expect(handler1).toHaveBeenLastCalledWith(2)
    expect(handler2).toHaveBeenLastCalledWith(2)

    // Incrementing B should only change callback2
    incBBtn.click()
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(callbacks1[2]).toBe(callbacks1[1]) // callback1 unchanged
    expect(callbacks2[2]).not.toBe(callbacks2[1])

    test1Btn.click()
    test2Btn.click()
    expect(handler1).toHaveBeenLastCalledWith(2)
    expect(handler2).toHaveBeenLastCalledWith(3)
  })
})