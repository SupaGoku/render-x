import { render, h } from '../src'

const container = document.createElement('div')
document.body.appendChild(container)

let clicked = false

render(
  container,
  h('button', { onClick: () => { clicked = true } }, 'Click me')
)

console.log('Container HTML:', container.innerHTML)
console.log('Button element:', container.querySelector('button'))

const button = container.querySelector('button')
if (button) {
  console.log('Button found, clicking...')
  button.click()
  console.log('Clicked:', clicked)
}