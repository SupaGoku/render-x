import type { RenderXContext } from '../context'
import { readContextValue } from '../context/internal'

export const useContext = <T>(context: RenderXContext<T>): T => {
  if (!context) throw new Error('useContext requires a valid context object returned by createContext')

  return readContextValue(context)
}
