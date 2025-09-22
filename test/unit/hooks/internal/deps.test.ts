import { describe, test, expect } from 'vitest'
import { areDepsEqual } from '../../../../src/hooks/internal/deps'

describe('areDepsEqual', () => {
  test('returns true for identical references', () => {
    const deps = [1, 2, 3]
    expect(areDepsEqual(deps, deps)).toBe(true)
  })

  test('returns true for equal primitive arrays', () => {
    expect(areDepsEqual([1, 2, 3], [1, 2, 3])).toBe(true)
    expect(areDepsEqual(['a', 'b', 'c'], ['a', 'b', 'c'])).toBe(true)
    expect(areDepsEqual([true, false, true], [true, false, true])).toBe(true)
  })

  test('returns false for different primitive values', () => {
    expect(areDepsEqual([1, 2, 3], [1, 2, 4])).toBe(false)
    expect(areDepsEqual(['a', 'b'], ['a', 'c'])).toBe(false)
    expect(areDepsEqual([true], [false])).toBe(false)
  })

  test('returns false for different lengths', () => {
    expect(areDepsEqual([1, 2], [1, 2, 3])).toBe(false)
    expect(areDepsEqual([1, 2, 3], [1, 2])).toBe(false)
    expect(areDepsEqual([], [1])).toBe(false)
  })

  test('handles undefined and null deps', () => {
    expect(areDepsEqual(undefined, undefined)).toBe(true)
    expect(areDepsEqual(null as any, null as any)).toBe(true)
    expect(areDepsEqual(undefined, null as any)).toBe(false)
    expect(areDepsEqual(undefined, [])).toBe(false)
    expect(areDepsEqual([], undefined)).toBe(false)
    expect(areDepsEqual(null as any, [])).toBe(false)
  })

  test('returns true for empty arrays', () => {
    expect(areDepsEqual([], [])).toBe(true)
  })

  test('uses Object.is for comparison (handles NaN and -0)', () => {
    expect(areDepsEqual([NaN], [NaN])).toBe(true)
    expect(areDepsEqual([0], [-0])).toBe(false)
    expect(areDepsEqual([-0], [0])).toBe(false)
    expect(areDepsEqual([NaN, 1], [NaN, 1])).toBe(true)
  })

  test('compares object references, not values', () => {
    const obj1 = { value: 1 }
    const obj2 = { value: 1 }
    const obj3 = obj1

    expect(areDepsEqual([obj1], [obj1])).toBe(true)
    expect(areDepsEqual([obj1], [obj3])).toBe(true)
    expect(areDepsEqual([obj1], [obj2])).toBe(false)
  })

  test('handles mixed types', () => {
    const obj = { a: 1 }
    const fn = () => {}
    const arr = [1, 2, 3]

    expect(areDepsEqual([1, 'str', obj, fn, arr], [1, 'str', obj, fn, arr])).toBe(true)
    expect(areDepsEqual([1, 'str', obj], [1, 'str', { a: 1 }])).toBe(false)
  })

  test('handles null and undefined in arrays', () => {
    expect(areDepsEqual([null], [null])).toBe(true)
    expect(areDepsEqual([undefined], [undefined])).toBe(true)
    expect(areDepsEqual([null], [undefined])).toBe(false)
    expect(areDepsEqual([null, undefined], [null, undefined])).toBe(true)
    expect(areDepsEqual([undefined, null], [null, undefined])).toBe(false)
  })

  test('handles symbols', () => {
    const sym1 = Symbol('test')
    const sym2 = Symbol('test')

    expect(areDepsEqual([sym1], [sym1])).toBe(true)
    expect(areDepsEqual([sym1], [sym2])).toBe(false)
  })

  test('complex real-world scenarios', () => {
    const callback = () => {}
    const state = { count: 0 }

    expect(areDepsEqual(
      [state.count, callback, 'constant'],
      [state.count, callback, 'constant']
    )).toBe(true)

    state.count = 1
    expect(areDepsEqual(
      [state.count, callback, 'constant'],
      [0, callback, 'constant']
    )).toBe(false)

    const newCallback = () => {}
    expect(areDepsEqual(
      [state.count, callback, 'constant'],
      [state.count, newCallback, 'constant']
    )).toBe(false)
  })
})