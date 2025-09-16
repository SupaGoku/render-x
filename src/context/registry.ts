import type { RenderXContext } from './types'

interface ContextRecord<T> {
  stack: T[]
}

const registry = new WeakMap<RenderXContext<any>, ContextRecord<any>>()

const getRecord = <T>(context: RenderXContext<T>): ContextRecord<T> => {
  let record = registry.get(context) as ContextRecord<T> | undefined
  if (!record) {
    record = { stack: [] }
    registry.set(context, record)
  }
  return record
}

export const beginContext = <T>(context: RenderXContext<T>, value: T): void => {
  const record = getRecord(context)
  record.stack.push(value)
}

export const endContext = <T>(context: RenderXContext<T>): void => {
  const record = getRecord(context)
  record.stack.pop()
}

export const readContextValue = <T>(context: RenderXContext<T>): T => {
  const record = getRecord(context)
  if (record.stack.length > 0) {
    return record.stack[record.stack.length - 1] as T
  }
  return context.defaultValue
}

