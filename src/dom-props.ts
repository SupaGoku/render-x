import { registerEventHandler } from './event-manager'
import type { VNodeProps } from './types'

const setElementStyle = (element: HTMLElement, style: unknown): void => {
  if (typeof style === 'string') {
    element.style.cssText = style
  } else if (style && typeof style === 'object') {
    Object.assign(element.style, style as Partial<CSSStyleDeclaration>)
  }
}

export const classNamesMatch = (current: string, next: string): boolean => {
  if (current === next) return true

  const normalize = (value: string): string[] => value.trim().split(/\s+/).filter(Boolean).sort()

  const currentList = normalize(current)
  const nextList = normalize(next)

  if (currentList.length !== nextList.length) {
    return false
  }

  for (let i = 0; i < currentList.length; i++) {
    if (currentList[i] !== nextList[i]) {
      return false
    }
  }

  return true
}

const syncProperty = (element: Element, key: string, value: unknown, isInitial: boolean): void => {
  if (value == null) return

  if (key.startsWith('on') && typeof value === 'function') {
    if (isInitial) {
      registerEventHandler(element, key, value as (event: Event) => void)
    }
    return
  }

  switch (key) {
    case 'className': {
      const nextClassName = String(value ?? '')
      if (isInitial || !classNamesMatch(element.className, nextClassName)) {
        element.className = nextClassName
      }
    }
    case 'style': {
      setElementStyle(element as HTMLElement, value)
    }
    case 'id':
      element.setAttribute('id', String(value))

    default: {
      if (key.startsWith('data-')) {
        element.setAttribute(key, String(value))
      } else {
        ;(element as unknown as Record<string, unknown>)[key] = value
      }
    }
  }
}

export const applyElementProps = (element: Element, props: VNodeProps): void => {
  const entries = Object.entries(props ?? {}) as [string, unknown][]
  for (const [key, value] of entries) {
    syncProperty(element, key, value, true)
  }
}

export const updateElementProps = (element: Element, props: VNodeProps): void => {
  const entries = Object.entries(props ?? {}) as [string, unknown][]
  for (const [key, value] of entries) {
    syncProperty(element, key, value, false)
  }
}
