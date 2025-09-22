
export const areDepsEqual = (a: readonly any[] | undefined, b: readonly any[] | undefined): boolean => {
  if (a === b) return true
  if (!a || !b) return false
  if (a.length !== b.length) return false

  for (let i = 0; i < a.length; i++) {
    if (!Object.is(a[i], b[i])) return false
  }

  return true
}

