import { describe, expect, it } from 'vitest'
import { __depsInternals, areDepsEqual } from '../../../hooks/internal/deps'

describe('areDepsEqual', () => {
  it('handles primitive comparisons and undefined arrays', () => {
    expect(areDepsEqual(undefined, undefined)).toBe(true)
    expect(areDepsEqual(undefined, [1])).toBe(false)
    expect(areDepsEqual([1, 2], [1, 2])).toBe(true)
    expect(areDepsEqual([1], [2])).toBe(false)
    expect(areDepsEqual([1, 2], [1])).toBe(false)
    expect(areDepsEqual({ foo: 1 } as any, { foo: 1 } as any)).toBe(true)
    expect(areDepsEqual({ foo: 1 } as any, { foo: 2 } as any)).toBe(false)
  })

  it('performs deep comparisons across complex data structures', () => {
    const dateA = new Date('2024-01-01')
    const dateB = new Date('2024-01-01')
    const regexA = /abc/gi
    const regexB = /abc/gi
    const mapA = new Map([['key', { nested: 1 }]])
    const mapB = new Map([['key', { nested: 1 }]])
    const setA = new Set([1, 2])
    const setB = new Set([1, 2])
    const typedA = new Uint8Array([1, 2, 3])
    const typedB = new Uint8Array([1, 2, 3])
    const circularA: any = { self: null }
    const circularB: any = { self: null }
    circularA.self = circularA
    circularB.self = circularB

    const depsA = [dateA, regexA, ['array', { value: 1 }], mapA, setA, typedA, circularA]

    const depsB = [dateB, regexB, ['array', { value: 1 }], mapB, setB, typedB, circularB]

    expect(areDepsEqual(depsA, depsB)).toBe(true)
    expect(areDepsEqual([['nested', ['array']]], [['nested', ['array']]])).toBe(true)
    expect(areDepsEqual([['nested', ['array']]], [['nested', ['different']]])).toBe(false)
  })

  it('detects mismatches for differing prototypes or typed array contents', () => {
    const objectA = Object.create(null)
    objectA.value = 1
    const objectB = { value: 1 }

    expect(areDepsEqual([objectA], [objectB])).toBe(false)
    expect(areDepsEqual([new Uint8Array([1, 2])], [new Uint8Array([1, 3])])).toBe(false)
    expect(areDepsEqual([new Uint8Array([1, 2])], [new Uint8Array([1, 2, 3])])).toBe(false)
    expect(areDepsEqual([new Map([['a', 1]])], [new Map([['a', 2]])])).toBe(false)
    expect(areDepsEqual([new Set([1, 2])], [new Set([1, 3])])).toBe(false)
    expect(areDepsEqual([new Set([1, 2])], [new Set([1])])).toBe(false)
  })

  it('treats empty arrays and matching maps/sets as equal dependencies', () => {
    expect(areDepsEqual([], [])).toBe(true)

    const mapA = new Map([['key', { nested: 'value' }]])
    const mapB = new Map([['key', { nested: 'value' }]])

    expect(areDepsEqual(mapA as any, mapB as any)).toBe(true)

    const setA = new Set(['a', 'b'])
    const setB = new Set(['a', 'b'])
    expect(areDepsEqual(setA as any, setB as any)).toBe(true)

    const typedA = new Uint8Array([1, 2, 3])
    const typedB = new Uint8Array([1, 2, 3])
    expect(areDepsEqual(typedA as any, typedB as any)).toBe(true)

    expect(areDepsEqual([[1, 2]], [[1, 2]])).toBe(true)
    expect(areDepsEqual([[1, 2]], [[2, 1]])).toBe(false)
  })

  it('handles circular references by tracking previously seen objects', () => {
    const cyclicA: any = {}
    const cyclicB: any = {}
    cyclicA.self = cyclicA
    cyclicB.self = cyclicB

    expect(areDepsEqual(cyclicA, cyclicB)).toBe(true)

    const regexA = /test/gi
    const regexB = /test/gi
    expect(areDepsEqual(regexA as any, regexB as any)).toBe(true)

    const objectA = { alpha: 1, nested: { beta: 2 } }
    const objectB = { alpha: 1, nested: { beta: 2 } }
    expect(areDepsEqual(objectA as any, objectB as any)).toBe(true)
  })

  it('exposes deepEqual for advanced comparisons', () => {
    const { deepEqual } = __depsInternals
    expect(deepEqual(new Date('2024-01-01'), new Date('2024-01-01'))).toBe(true)
    expect(deepEqual(new Map([['key', { nested: ['value'] }]]), new Map([['key', { nested: ['value'] }]]))).toBe(true)
    expect(deepEqual(new Map([['key', 1]]), new Map([['other', 1]]))).toBe(false)
    expect(deepEqual(new Map([['one', 1]]), new Map())).toBe(false)

    const setA = new Set([1, 2])
    const setB = new Set([1, 2])
    expect(deepEqual(setA, setB)).toBe(true)

    const typedA = new Uint16Array([1, 2, 3])
    const typedB = new Uint16Array([1, 2, 4])
    expect(deepEqual(typedA, typedB)).toBe(false)

    expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true)
    expect(deepEqual([1, 2], [1, 2, 3])).toBe(false)
    expect(deepEqual({}, [])).toBe(false)
    expect(deepEqual({ alpha: 1 }, { alpha: 1, beta: 2 })).toBe(false)
    expect(deepEqual({ alpha: 1, beta: 2 }, { alpha: 1 })).toBe(false)
    expect(deepEqual({ nested: { value: 1 } }, { nested: { value: 2 } })).toBe(false)
  })
})
