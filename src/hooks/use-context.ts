import type { RenderXContext } from '../context/types'
import { getHookContext } from './internal/context'

export const useContext = <T>(context: RenderXContext<T>): T => {
  if (!context) throw new Error('useContext requires a valid context object')

  const hookContext = getHookContext()
  let node = hookContext.node

  let depth = 0
  while (node && depth < 150) {
    if (node.context?.definition?.id === context.id && node.context?.value !== undefined) return node.context.value as T

    node = node.parent
    depth++
  }

  return context.defaultValue
}
