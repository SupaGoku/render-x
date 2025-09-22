import { expect } from 'vitest'
import { onTestCleanup } from './setup'

export const createTestContainer = (): HTMLElement => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  onTestCleanup(() => container.remove())

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

export const expectElementStability = (before: Element[], after: Element[], expectedMapping: number[]): void => {
  expectedMapping.forEach((afterIndex, beforeIndex) => {
    expect(after[afterIndex]).toBe(before[beforeIndex])
  })
}

export const expectHookStability = (component: any, expectedRenderCount: number): void => {
  expect(component.__renderCount).toBe(expectedRenderCount)
}

export const captureElementRefs = (container: Element): Element[] => {
  return Array.from(container.querySelectorAll('*'))
}

export const expectDOMIdentityPreserved = (
  originalElements: Element[],
  newElements: Element[],
  preservedIndices: number[]
): void => {
  preservedIndices.forEach((index) => {
    expect(newElements[index]).toBe(originalElements[index])
  })
}

export const createElementTracker = () => {
  let savedElements: Element[] = []

  return {
    capture: (container: Element) => {
      savedElements = Array.from(container.children)
      return savedElements
    },

    verify: (container: Element, expectedMapping: { [newIndex: number]: number }) => {
      const currentElements = Array.from(container.children)
      Object.entries(expectedMapping).forEach(([newIndexStr, oldIndex]) => {
        const newIndex = parseInt(newIndexStr)
        expect(currentElements[newIndex]).toBe(savedElements[oldIndex])
      })
    },

    getSaved: () => savedElements,
  }
}
