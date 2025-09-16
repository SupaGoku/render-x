import { onTestCleanup } from './setup'

export const createTestContainer = (): HTMLElement => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  onTestCleanup(() => {
    container.remove()
  })
  return container
}

export const flushMicrotasks = async (): Promise<void> => {
  await Promise.resolve()
}

export const flushTimers = async (): Promise<void> => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 0)
  })
}

export const flushAnimationFrame = async (): Promise<void> => {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve())
  })
}
