const objectToString = Object.prototype.toString

const deepEqual = (valueA: unknown, valueB: unknown, seen: WeakMap<object, unknown> = new WeakMap()): boolean => {
  if (Object.is(valueA, valueB)) return true

  if (typeof valueA !== 'object' || valueA === null || typeof valueB !== 'object' || valueB === null) {
    return false
  }

  const objectA = valueA as Record<PropertyKey, unknown>
  const objectB = valueB as Record<PropertyKey, unknown>

  if (seen.has(objectA)) {
    return seen.get(objectA) === objectB
  }

  seen.set(objectA, objectB)

  const tagA = objectToString.call(objectA)
  const tagB = objectToString.call(objectB)

  if (tagA !== tagB) return false

  if (tagA === '[object Date]') {
    return (valueA as Date).getTime() === (valueB as Date).getTime()
  }

  if (tagA === '[object RegExp]') {
    return String(valueA) === String(valueB)
  }

  if (Array.isArray(objectA)) {
    if (objectA.length !== (valueB as unknown[]).length) return false
    for (let i = 0; i < objectA.length; i++) {
      if (!deepEqual(objectA[i], (valueB as unknown[])[i], seen)) return false
    }
    return true
  }

  if (ArrayBuffer.isView(valueA) && ArrayBuffer.isView(valueB)) {
    const typedA = valueA as ArrayBufferView
    const typedB = valueB as ArrayBufferView
    if (typedA.byteLength !== typedB.byteLength) {
      return false
    }
    const viewA = new Uint8Array(typedA.buffer, typedA.byteOffset, typedA.byteLength)
    const viewB = new Uint8Array(typedB.buffer, typedB.byteOffset, typedB.byteLength)
    for (let i = 0; i < viewA.length; i++) {
      if (viewA[i] !== viewB[i]) return false
    }
    return true
  }

  if (valueA instanceof Map && valueB instanceof Map) {
    if (valueA.size !== valueB.size) return false
    for (const [keyA, entryValueA] of valueA) {
      if (!valueB.has(keyA)) return false
      if (!deepEqual(entryValueA, valueB.get(keyA), seen)) return false
    }
    return true
  }

  if (valueA instanceof Set && valueB instanceof Set) {
    if (valueA.size !== valueB.size) return false
    for (const itemA of valueA) {
      if (!valueB.has(itemA)) return false
    }
    return true
  }

  if (Object.getPrototypeOf(objectA) !== Object.getPrototypeOf(objectB)) {
    return false
  }

  const keysA = Reflect.ownKeys(objectA)
  const keysB = Reflect.ownKeys(objectB)
  if (keysA.length !== keysB.length) return false

  const keysBSet = new Set(keysB)
  for (const key of keysA) {
    /* c8 ignore next */
    if (!keysBSet.has(key)) return false
    /* c8 ignore next */
    if (!deepEqual(objectA[key], objectB[key], seen)) return false
  }

  return true
}

export const areDepsEqual = (a: readonly any[] | undefined, b: readonly any[] | undefined): boolean => {
  if (a === b) return true
  if (!a || !b) return false

  if (!Array.isArray(a) || !Array.isArray(b)) return deepEqual(a, b)

  if (a.length !== b.length) return false

  for (let i = 0; i < a.length; i++) return deepEqual(a[i], b[i])

  return true
}

export const __depsInternals = {
  deepEqual,
}
