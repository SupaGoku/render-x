import type { DelegatedEventType } from './types'

const eventDelegates = new Map<Element, Set<DelegatedEventType>>()
const eventHandlers = new WeakMap<Element, Map<string, (event: Event) => void>>()
const rootEventHandlers = new WeakMap<Element, Map<DelegatedEventType, (event: Event) => void>>()

export const registerEventHandler = (element: Element, eventKey: string, handler: (event: Event) => void): void => {
  const eventType = eventKey.slice(2).toLowerCase() as DelegatedEventType

  if (!eventHandlers.has(element)) {
    eventHandlers.set(element, new Map())
  }

  eventHandlers.get(element)!.set(eventType, handler)
}

export const setupEventDelegation = (root: Element): void => {
  const supportedEvents: DelegatedEventType[] = ['click', 'input', 'submit', 'keydown', 'focus', 'blur']
  const rootDelegates = new Set<DelegatedEventType>()
  const rootHandlers = new Map<DelegatedEventType, (event: Event) => void>()

  for (const eventType of supportedEvents) {
    if (hasEventHandlers(root, eventType)) {
      rootDelegates.add(eventType)

      const delegatedHandler = (event: Event) => {
        handleDelegatedEvent(event, eventType)
      }

      rootHandlers.set(eventType, delegatedHandler)
      root.addEventListener(eventType, delegatedHandler, true)
    }
  }

  if (rootDelegates.size > 0) {
    eventDelegates.set(root, rootDelegates)
    rootEventHandlers.set(root, rootHandlers)
  }
}

export function cleanupEvents(element: Element): void {
  const delegates = eventDelegates.get(element)
  const handlers = rootEventHandlers.get(element)
  if (delegates && handlers) {
    for (const eventType of delegates) {
      const handler = handlers.get(eventType)
      if (handler) {
        element.removeEventListener(eventType, handler, true)
      }
    }
    eventDelegates.delete(element)
    rootEventHandlers.delete(element)
  }
}

const hasEventHandlers = (root: Element, eventType: DelegatedEventType): boolean => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null)

  let node: Element | null = walker.currentNode as Element
  while (node) {
    const handlers = eventHandlers.get(node)
    if (handlers && handlers.has(eventType)) {
      return true
    }
    node = walker.nextNode() as Element
  }

  return false
}

function handleDelegatedEvent(event: Event, eventType: DelegatedEventType): void {
  let target = event.target as Element | null

  while (target) {
    const handlers = eventHandlers.get(target)
    if (handlers && handlers.has(eventType)) {
      const handler = handlers.get(eventType)
      if (handler) {
        handler(event)
        break
      }
    }
    target = target.parentElement
  }
}
