import { syncDOM } from './dom-sync'
import { hasEffectsToRun, runEffects } from './hooks/internal/effect-utils'
import { HookInstance } from './hooks/internal/types'
import { mountTree, updateTree } from './mount'
import { RenderXElement, RenderXNode, RenderXTree } from './types'
import { isNode } from './vdom'

interface RuntimeState {
  roots: Map<Element, { tree: RenderXTree; element: RenderXElement }>
}

const state: RuntimeState = {
  roots: new Map(),
}

export const render = (containerElement: Element, element: RenderXElement, isPortal: boolean = false): void => {
  if (!containerElement) throw new Error('Container element is required')

  const existing = state.roots.get(containerElement)

  if (existing && !isPortal) throw new Error('Cannot render into an already mounted container')
  if (containerElement.hasChildNodes()) throw new Error('Container must be empty for initial render')

  const tree = mountTree(element)

  setupSchedulers(tree, containerElement)
  state.roots.set(containerElement, { tree, element })
  syncDOM(containerElement, null, tree)

  runComponentEffects(tree)
}

const update = (container: Element, newElement: RenderXElement): void => {
  const existing = state.roots.get(container)
  if (!existing) return

  const oldTree = existing.tree
  const newTree = updateTree(oldTree.element, newElement)

  setupSchedulers(newTree, container)
  syncDOM(container, oldTree, newTree)
  state.roots.set(container, { tree: newTree, element: newElement })

  runComponentEffects(newTree)
}

const setupSchedulers = (tree: RenderXTree, container: Element): void => {
  walkTree(tree, (callbackTree) => {
    if (isNode(callbackTree.element) && callbackTree.element.hookInstance) {
      const instance = callbackTree.element.hookInstance as HookInstance
      instance.scheduleUpdate = () => scheduleComponentUpdate(container, instance)
      instance.mounted = true
    }
  })
}

const walkTree = (tree: RenderXTree, callback: (tree: RenderXTree) => void): void => {
  if (isNode(tree.element) && tree.element.__internal.children) {
    tree.element.__internal.children.forEach((child) => walkTree(child, callback))
  }

  callback(tree)
}

const runComponentEffects = (tree: RenderXTree): void => {
  walkTree(tree, (callbackTree) => {
    if (isNode(callbackTree.element) && callbackTree.element.hookInstance) {
      const instance = callbackTree.element.hookInstance

      if (instance.mounted && !instance.unmounted && hasEffectsToRun(callbackTree.element)) {
        runEffectsForInstance(callbackTree.element)
      }
    }
  })
}

let updateQueue = new Set<{ container: Element; instance: HookInstance }>()
let isFlushScheduled = false

const scheduleComponentUpdate = (container: Element, instance: HookInstance): void => {
  updateQueue.add({ container, instance })

  if (!isFlushScheduled) {
    isFlushScheduled = true
    queueMicrotask(() => flushComponentUpdates())
  }
}

const flushComponentUpdates = (): void => {
  isFlushScheduled = false
  const updates = Array.from(updateQueue)
  updateQueue.clear()

  const containerGroups = new Map<Element, HookInstance[]>()

  for (const { container, instance } of updates) {
    if (!containerGroups.has(container)) {
      containerGroups.set(container, [])
    }
    containerGroups.get(container)!.push(instance)
  }

  for (const [container] of containerGroups) {
    const existing = state.roots.get(container)
    if (!existing) continue

    update(container, existing.element)
  }
}

const runEffectsForInstance = (node: RenderXNode): void => {
  if (typeof requestAnimationFrame !== 'undefined') {
    requestAnimationFrame(() => {
      runEffects(node)
    })
  } else {
    queueMicrotask(() => {
      runEffects(node)
    })
  }
}

export const unmount = (container: Element): void => {
  const existing = state.roots.get(container)
  if (!existing) return

  walkTree(existing.tree, (callbackTree) => {
    if (isNode(callbackTree.element) && callbackTree.element.hookInstance) {
      const instance = callbackTree.element.hookInstance
      instance.unmounted = true
      instance.mounted = false
    }
  })

  container.innerHTML = ''
  state.roots.delete(container)
}
