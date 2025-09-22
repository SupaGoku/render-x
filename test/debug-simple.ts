import { render, h, useState } from '../src'

// Simple debug test
const Counter = () => {
  console.log('[Counter] Rendering')
  const [count, setCount] = useState(0)
  console.log('[Counter] Count is:', count)

  return h('div', null,
    h('span', { id: 'count' }, `Count: ${count}`),
    h('button', {
      id: 'btn',
      onClick: () => {
        console.log('[Counter] Button clicked, updating to', count + 1)
        setCount(count + 1)
      }
    }, 'Increment')
  )
}

const container = document.createElement('div')
document.body.appendChild(container)

console.log('=== Initial render ===')
render(container, h(Counter, null))

const button = document.getElementById('btn')
const span = document.getElementById('count')

console.log('Initial span text:', span?.textContent)

if (button) {
  console.log('=== Clicking button ===')
  button.click()

  setTimeout(() => {
    console.log('After click span text:', document.getElementById('count')?.textContent)
  }, 50)
}