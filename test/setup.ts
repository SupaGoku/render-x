import { beforeEach } from 'vitest'

if (!('requestAnimationFrame' in globalThis)) {
  globalThis.requestAnimationFrame = (callback: FrameRequestCallback): number => {
    return setTimeout(() => callback(performance.now()), 0) as unknown as number
  }

  globalThis.cancelAnimationFrame = (handle: number): void => {
    clearTimeout(handle)
  }
}

type Cleanup = () => void
const cleanups: Cleanup[] = []

export const onTestCleanup = (fn: Cleanup): void => {
  cleanups.push(fn)
}

beforeEach(() => {
  while (cleanups.length) {
    const cleanup = cleanups.pop()
    cleanup?.()
  }
})
