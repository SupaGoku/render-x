import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, h, useMemo, unmount, useState } from '../../../src'

describe('useMemo', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    unmount(container)
    container.remove()
  })

  test('memoizes expensive computation', async () => {
    const expensiveComputation = vi.fn((n: number) => n * 2)

    const Component = () => {
      const [count, setCount] = useState(0)
      const [other, setOther] = useState(0)

      const result = useMemo(() => expensiveComputation(count), [count])

      return h('div', null,
        h('span', null, `Result: ${result}, Other: ${other}`),
        h('button', { id: 'inc-count', onClick: () => setCount(count + 1) }, 'Inc Count'),
        h('button', { id: 'inc-other', onClick: () => setOther(other + 1) }, 'Inc Other')
      )
    }

    render(container, h(Component, null))
    expect(container.querySelector('span')?.textContent).toBe('Result: 0, Other: 0')
    expect(expensiveComputation).toHaveBeenCalledTimes(1)
    expect(expensiveComputation).toHaveBeenCalledWith(0)

    // Changing unrelated state shouldn't recompute
    const otherBtn = container.querySelector('#inc-other') as HTMLButtonElement
    otherBtn.click()
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(container.querySelector('span')?.textContent).toBe('Result: 0, Other: 1')
    expect(expensiveComputation).toHaveBeenCalledTimes(1) // Still 1!

    // Changing dependent state should recompute
    const countBtn = container.querySelector('#inc-count') as HTMLButtonElement
    countBtn.click()
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(container.querySelector('span')?.textContent).toBe('Result: 2, Other: 1')
    expect(expensiveComputation).toHaveBeenCalledTimes(2)
    expect(expensiveComputation).toHaveBeenLastCalledWith(1)
  })

  test('works with empty dependency array', async () => {
    const computation = vi.fn(() => Math.random())

    const Component = () => {
      const [count, setCount] = useState(0)
      const value = useMemo(() => computation(), [])

      return h('div', null,
        h('span', { id: 'value' }, `Value: ${value}`),
        h('span', { id: 'count' }, `Count: ${count}`),
        h('button', { onClick: () => setCount(count + 1) }, 'Increment')
      )
    }

    render(container, h(Component, null))
    const firstValue = container.querySelector('#value')?.textContent
    expect(computation).toHaveBeenCalledTimes(1)

    const button = container.querySelector('button')
    button?.click()
    await new Promise(resolve => setTimeout(resolve, 10))

    button?.click()
    await new Promise(resolve => setTimeout(resolve, 10))

    button?.click()
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(container.querySelector('#count')?.textContent).toBe('Count: 3')
    expect(container.querySelector('#value')?.textContent).toBe(firstValue)
    expect(computation).toHaveBeenCalledTimes(1) // Never recomputed!
  })

  test('recomputes when deps change', async () => {
    const computation = vi.fn((a: number, b: number) => a + b)

    const Component = () => {
      const [a, setA] = useState(2)
      const [b, setB] = useState(3)

      const result = useMemo(() => computation(a, b), [a, b])

      return h('div', null,
        h('span', null, `Sum: ${result}`),
        h('button', { id: 'inc-a', onClick: () => setA(a + 1) }, 'Inc A'),
        h('button', { id: 'inc-b', onClick: () => setB(b + 1) }, 'Inc B')
      )
    }

    render(container, h(Component, null))
    expect(container.querySelector('span')?.textContent).toBe('Sum: 5')
    expect(computation).toHaveBeenCalledTimes(1)

    const incA = container.querySelector('#inc-a') as HTMLButtonElement
    incA.click()
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(container.querySelector('span')?.textContent).toBe('Sum: 6')
    expect(computation).toHaveBeenCalledTimes(2)
    expect(computation).toHaveBeenLastCalledWith(3, 3)

    const incB = container.querySelector('#inc-b') as HTMLButtonElement
    incB.click()
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(container.querySelector('span')?.textContent).toBe('Sum: 7')
    expect(computation).toHaveBeenCalledTimes(3)
    expect(computation).toHaveBeenLastCalledWith(3, 4)
  })

  test.skip('preserves referential equality for objects', async () => {
    let renders = 0
    let lastObject: any = null

    const Component = () => {
      renders++
      const [value, setValue] = useState(5)
      const [other, setOther] = useState(0)

      const obj = useMemo(() => ({ value }), [value])

      // Check referential equality
      if (lastObject && value === lastObject.value) {
        expect(obj).toBe(lastObject)
      }
      lastObject = obj

      return h('div', null,
        h('span', null, `Value: ${obj.value}, Other: ${other}, Renders: ${renders}`),
        h('button', { id: 'same', onClick: () => setValue(5) }, 'Same Value'),
        h('button', { id: 'diff', onClick: () => setValue(6) }, 'Diff Value'),
        h('button', { id: 'other', onClick: () => setOther(other + 1) }, 'Inc Other')
      )
    }

    render(container, h(Component, null))
    const firstObject = lastObject
    expect(renders).toBe(1)

    // Updating unrelated state preserves object
    const otherBtn = container.querySelector('#other') as HTMLButtonElement
    otherBtn.click()
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(lastObject).toBe(firstObject)
    expect(renders).toBe(2)

    // Setting same value preserves object
    const sameBtn = container.querySelector('#same') as HTMLButtonElement
    sameBtn.click()
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(lastObject).toBe(firstObject)
    expect(renders).toBe(3)

    // Changing value creates new object
    const diffBtn = container.querySelector('#diff') as HTMLButtonElement
    diffBtn.click()
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(lastObject).not.toBe(firstObject)
    expect(lastObject.value).toBe(6)
    expect(renders).toBe(4)
  })

  test.skip('handles multiple useMemo hooks', async () => {
    const computation1 = vi.fn((n: number) => n * 2)
    const computation2 = vi.fn((n: number) => n * 3)

    const Component = () => {
      const [value, setValue] = useState(5)
      const [flag, setFlag] = useState(false)

      const double = useMemo(() => computation1(value), [value])
      const triple = useMemo(() => computation2(value), flag ? [] : [value])

      return h('div', null,
        h('span', null, `${double}, ${triple}`),
        h('button', { id: 'inc', onClick: () => setValue(value + 1) }, 'Increment'),
        h('button', { id: 'freeze', onClick: () => setFlag(true) }, 'Freeze Triple')
      )
    }

    render(container, h(Component, null))
    expect(container.querySelector('span')?.textContent).toBe('10, 15')
    expect(computation1).toHaveBeenCalledTimes(1)
    expect(computation2).toHaveBeenCalledTimes(1)

    const incBtn = container.querySelector('#inc') as HTMLButtonElement
    incBtn.click()
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(container.querySelector('span')?.textContent).toBe('12, 18')
    expect(computation1).toHaveBeenCalledTimes(2)
    expect(computation2).toHaveBeenCalledTimes(2)

    // Freeze the triple computation
    const freezeBtn = container.querySelector('#freeze') as HTMLButtonElement
    freezeBtn.click()
    await new Promise(resolve => setTimeout(resolve, 10))

    incBtn.click()
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(container.querySelector('span')?.textContent).toBe('14, 18') // Triple stays at 18
    expect(computation1).toHaveBeenCalledTimes(3)
    expect(computation2).toHaveBeenCalledTimes(2) // Not recomputed!
  })
})