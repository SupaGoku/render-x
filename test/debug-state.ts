import { render, h, useState } from '../src'

const container = document.createElement('div')
document.body.appendChild(container)

const Counter = () => {
  const [count, setCount] = useState(0)
  console.log('Rendering Counter with count:', count)

  return h('div', null,
    h('span', null, `Count: ${count}`),
    h('button', {
      onClick: () => {
        console.log('Button clicked, updating count from', count, 'to', count + 1)
        setCount(count + 1)
      }
    }, 'Increment')
  )
}

render(container, h(Counter, null))

console.log('Initial HTML:', container.innerHTML)

const button = container.querySelector('button')
if (button) {
  console.log('Clicking button...')
  button.click()

  setTimeout(() => {
    console.log('After click HTML:', container.innerHTML)
  }, 100)
}