import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { render, h, useState, useEffect, createContext, useContext } from '../../src'

describe('Basic Rendering', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    container.remove()
  })

  test('renders simple elements', () => {
    render(container, h('div', { className: 'test' }, 'Hello World'))

    expect(container.innerHTML).toBe('<div class="test">Hello World</div>')
    expect(container.querySelector('.test')?.textContent).toBe('Hello World')
  })

  test('renders nested elements', () => {
    render(
      container,
      h('div', null,
        h('h1', null, 'Title'),
        h('p', null, 'Content')
      )
    )

    expect(container.querySelector('h1')?.textContent).toBe('Title')
    expect(container.querySelector('p')?.textContent).toBe('Content')
  })

  test('handles event listeners', () => {
    let clicked = false

    render(
      container,
      h('button', { onClick: () => { clicked = true } }, 'Click me')
    )

    const button = container.querySelector('button')
    button?.click()

    expect(clicked).toBe(true)
  })

  test('functional components work', () => {
    const Component = () => h('div', null, 'Functional Component')

    render(container, h(Component, null))

    expect(container.textContent).toBe('Functional Component')
  })

  test('useState updates DOM', async () => {
    const Counter = () => {
      const [count, setCount] = useState(0)

      return h('div', null,
        h('span', null, `Count: ${count}`),
        h('button', { onClick: () => setCount(count + 1) }, 'Increment')
      )
    }

    render(container, h(Counter, null))

    expect(container.querySelector('span')?.textContent).toBe('Count: 0')

    const button = container.querySelector('button')
    button?.click()

    await new Promise(resolve => setTimeout(resolve, 10))

    expect(container.querySelector('span')?.textContent).toBe('Count: 1')
  })

  test('useEffect runs after render', async () => {
    let effectRan = false

    const Component = () => {
      useEffect(() => {
        effectRan = true
      }, [])

      return h('div', null, 'Component with effect')
    }

    render(container, h(Component, null))

    expect(effectRan).toBe(false)

    await new Promise(resolve => requestAnimationFrame(resolve))

    expect(effectRan).toBe(true)
  })

  test('context provides values', () => {
    const ThemeContext = createContext('light')

    const Child = () => {
      const theme = useContext(ThemeContext)
      return h('div', null, `Theme: ${theme}`)
    }

    const App = () => {
      return h(ThemeContext.Provider, { value: 'dark' },
        h(Child, null)
      )
    }

    render(container, h(App, null))

    expect(container.textContent).toBe('Theme: dark')
  })

  test('updates preserve DOM references', async () => {
    const Component = () => {
      const [text, setText] = useState('initial')

      return h('div', null,
        h('input', { value: text, onInput: (e: any) => setText(e.target.value) }),
        h('p', null, text)
      )
    }

    render(container, h(Component, null))

    const input = container.querySelector('input') as HTMLInputElement
    const p = container.querySelector('p')

    expect(input.value).toBe('initial')
    expect(p?.textContent).toBe('initial')

    const originalInput = input
    const originalP = p

    input.value = 'updated'
    input.dispatchEvent(new Event('input', { bubbles: true }))

    await new Promise(resolve => setTimeout(resolve, 10))

    expect(container.querySelector('input')).toBe(originalInput)
    expect(container.querySelector('p')).toBe(originalP)
    expect(p?.textContent).toBe('updated')
  })
})