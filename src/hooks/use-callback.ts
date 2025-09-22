import { useMemo } from './use-memo'

export const useCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: readonly any[] = []
): T => {
  return useMemo(() => callback, deps)
}

