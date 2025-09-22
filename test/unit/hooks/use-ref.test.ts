import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { render, h, useRef, useState, useEffect, unmount } from '../../../src'

describe('useRef', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    unmount(container)
    container.remove()
  })

  test('creates ref with initial value and preserves it', async () => {
    let refValues: any[] = []

    const Component = () => {
      const [count, setCount] = useState(0)
      const ref = useRef('initial')
      refValues.push(ref)

      return h('div', null,
        h('span', null, `Count: ${count}, Ref: ${ref.current}`),
        h('button', { onClick: () => setCount(count + 1) }, 'Increment')
      )
    }

    render(container, h(Component, null))
    expect(container.querySelector('span')?.textContent).toBe('Count: 0, Ref: initial')
    expect(refValues[0].current).toBe('initial')

    const button = container.querySelector('button') as HTMLButtonElement
    button.click()
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(container.querySelector('span')?.textContent).toBe('Count: 1, Ref: initial')
    expect(refValues[1]).toBe(refValues[0]) // Same ref object!
    expect(refValues[1].current).toBe('initial')
  })

  test.skip('mutations persist across renders', async () => {
    const Component = () => {
      const [count, setCount] = useState(0)
      const ref = useRef(0)

      const handleClick = () => {
        ref.current += 1
        setCount(count + 1)
      }

      return h('div', null,
        h('p', null, `State: ${count}, Ref: ${ref.current}`),
        h('button', { onClick: handleClick }, 'Increment Both')
      )
    }

    render(container, h(Component, null))
    expect(container.querySelector('p')?.textContent).toBe('State: 0, Ref: 0')

    const button = container.querySelector('button') as HTMLButtonElement
    button.click()
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(container.querySelector('p')?.textContent).toBe('State: 1, Ref: 1')

    button.click()
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(container.querySelector('p')?.textContent).toBe('State: 2, Ref: 2')
  })

  test('ref updates do not trigger re-renders', async () => {
    let renderCount = 0

    const Component = () => {
      renderCount++
      const ref = useRef(0)
      const [, forceUpdate] = useState(0)

      const updateRef = () => {
        ref.current += 1
        // No state update, so no re-render
      }

      const forceRender = () => {
        forceUpdate(Date.now())
      }

      return h('div', null,
        h('p', null, `Renders: ${renderCount}, Ref: ${ref.current}`),
        h('button', { id: 'update-ref', onClick: updateRef }, 'Update Ref'),
        h('button', { id: 'force-render', onClick: forceRender }, 'Force Render')
      )
    }

    render(container, h(Component, null))
    expect(renderCount).toBe(1)
    expect(container.querySelector('p')?.textContent).toBe('Renders: 1, Ref: 0')

    const updateRefBtn = container.querySelector('#update-ref') as HTMLButtonElement
    updateRefBtn.click()
    updateRefBtn.click()
    updateRefBtn.click()

    // Give it time to potentially re-render (it shouldn't)
    await new Promise(resolve => setTimeout(resolve, 10))
    expect(renderCount).toBe(1) // Still 1!

    // Force a render to see the updated ref value
    const forceRenderBtn = container.querySelector('#force-render') as HTMLButtonElement
    forceRenderBtn.click()
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(renderCount).toBe(2)
    expect(container.querySelector('p')?.textContent).toBe('Renders: 2, Ref: 3')
  })

  test('stores DOM element references', async () => {
    const Component = () => {
      const [mounted, setMounted] = useState(false)
      const elementRef = useRef<HTMLDivElement | null>(null)

      useEffect(() => {
        const div = document.createElement('div')
        div.className = 'ref-div'
        div.textContent = 'Referenced element'
        elementRef.current = div
        document.body.appendChild(div)
        setMounted(true)

        return () => {
          if (elementRef.current && elementRef.current.parentNode) {
            elementRef.current.remove()
          }
        }
      }, [])

      return h('div', null,
        h('span', null, mounted ? 'Element stored' : 'Not mounted'),
        h('button', {
          onClick: () => {
            if (elementRef.current) {
              elementRef.current.style.color = 'red'
            }
          }
        }, 'Change Color')
      )
    }

    render(container, h(Component, null))
    expect(container.querySelector('span')?.textContent).toBe('Not mounted')

    // Wait for effect to run
    await new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 10)))
    expect(container.querySelector('span')?.textContent).toBe('Element stored')

    const refDiv = document.querySelector('.ref-div') as HTMLDivElement
    expect(refDiv).toBeTruthy()
    expect(refDiv.textContent).toBe('Referenced element')

    const button = container.querySelector('button') as HTMLButtonElement
    button.click()
    expect(refDiv.style.color).toBe('red')

    // Cleanup
    refDiv.remove()
  })

  test('multiple refs in same component', async () => {
    const Component = () => {
      const [update, setUpdate] = useState(0)
      const ref1 = useRef('first')
      const ref2 = useRef('second')
      const ref3 = useRef('third')

      const modifyRefs = () => {
        ref1.current = 'modified-first'
        ref2.current = 'modified-second'
        // Leave ref3 unchanged
        setUpdate(update + 1) // Force re-render to see changes
      }

      return h('div', null,
        h('p', null, `${ref1.current}, ${ref2.current}, ${ref3.current}`),
        h('span', null, `Updates: ${update}`),
        h('button', { onClick: modifyRefs }, 'Modify Refs')
      )
    }

    render(container, h(Component, null))
    expect(container.querySelector('p')?.textContent).toBe('first, second, third')

    const button = container.querySelector('button') as HTMLButtonElement
    button.click()
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(container.querySelector('p')?.textContent).toBe('modified-first, modified-second, third')
    expect(container.querySelector('span')?.textContent).toBe('Updates: 1')
  })

  test('handles null and undefined initial values', async () => {
    const Component = ({ initialValue }: { initialValue: any }) => {
      const ref = useRef(initialValue)
      const [, forceUpdate] = useState(0)

      const updateRef = (value: any) => {
        ref.current = value
        forceUpdate(Date.now())
      }

      return h('div', null,
        h('span', null, `Value: ${ref.current === null ? 'null' : ref.current === undefined ? 'undefined' : ref.current}`),
        h('button', { id: 'set-string', onClick: () => updateRef('string') }, 'Set String'),
        h('button', { id: 'set-null', onClick: () => updateRef(null) }, 'Set Null'),
        h('button', { id: 'set-undefined', onClick: () => updateRef(undefined) }, 'Set Undefined')
      )
    }

    // Test with null initial value
    render(container, h(Component, { initialValue: null }))
    expect(container.querySelector('span')?.textContent).toBe('Value: null')

    const setStringBtn = container.querySelector('#set-string') as HTMLButtonElement
    setStringBtn.click()
    await new Promise(resolve => setTimeout(resolve, 10))
    expect(container.querySelector('span')?.textContent).toBe('Value: string')

    const setNullBtn = container.querySelector('#set-null') as HTMLButtonElement
    setNullBtn.click()
    await new Promise(resolve => setTimeout(resolve, 10))
    expect(container.querySelector('span')?.textContent).toBe('Value: null')

    // Test with undefined initial value
    unmount(container)
    render(container, h(Component, { initialValue: undefined }))
    expect(container.querySelector('span')?.textContent).toBe('Value: undefined')

    const setStringBtn2 = container.querySelector('#set-string') as HTMLButtonElement
    setStringBtn2.click()
    await new Promise(resolve => setTimeout(resolve, 10))
    expect(container.querySelector('span')?.textContent).toBe('Value: string')
  })

  test('stores complex objects and functions', async () => {
    const Component = () => {
      const [, forceUpdate] = useState(0)
      const complexRef = useRef({
        nested: {
          deeply: {
            value: 42
          }
        },
        array: [1, 2, 3],
        fn: (x: number) => x * 2
      })

      const modifyNested = () => {
        complexRef.current.nested.deeply.value = 100
        complexRef.current.array.push(4)
        forceUpdate(Date.now())
      }

      return h('div', null,
        h('p', null, `Value: ${complexRef.current.nested.deeply.value}`),
        h('span', null, `Array: ${complexRef.current.array.join(',')}`),
        h('em', null, `Function result: ${complexRef.current.fn(5)}`),
        h('button', { onClick: modifyNested }, 'Modify')
      )
    }

    render(container, h(Component, null))
    expect(container.querySelector('p')?.textContent).toBe('Value: 42')
    expect(container.querySelector('span')?.textContent).toBe('Array: 1,2,3')
    expect(container.querySelector('em')?.textContent).toBe('Function result: 10')

    const button = container.querySelector('button') as HTMLButtonElement
    button.click()
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(container.querySelector('p')?.textContent).toBe('Value: 100')
    expect(container.querySelector('span')?.textContent).toBe('Array: 1,2,3,4')
  })
})