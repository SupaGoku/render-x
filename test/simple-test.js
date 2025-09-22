const { render, h, useState } = require('../dist/index.js')

const Counter = () => {
  const [count, setCount] = useState(0)
  console.log('Rendering with count:', count)

  return h('div', null,
    h('span', null, `Count: ${count}`),
    h('button', {
      onClick: () => {
        console.log('Setting count to', count + 1)
        setCount(count + 1)
      }
    }, 'Increment')
  )
}

// Mock DOM
const mockContainer = {
  hasChildNodes: () => false,
  appendChild: (child) => {
    console.log('appendChild called with:', child)
  },
  querySelector: () => ({
    addEventListener: () => {},
    click: () => console.log('Button clicked')
  })
}

// Create mock document
global.document = {
  createElement: (tag) => {
    console.log('Creating element:', tag)
    return {
      tagName: tag,
      appendChild: () => {},
      addEventListener: () => {},
      setAttribute: () => {}
    }
  },
  createTextNode: (text) => {
    console.log('Creating text node:', text)
    return { nodeType: 3, textContent: text }
  }
}

console.log('=== Initial render ===')
try {
  render(mockContainer, h(Counter, null))
} catch (e) {
  console.log('Error:', e.message)
}