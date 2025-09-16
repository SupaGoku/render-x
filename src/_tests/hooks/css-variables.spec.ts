import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setCssVariable, setCssVariables } from '../../css-variables'

const root = () => document.querySelector(':root') as HTMLElement

beforeEach(() => {
  const element = root()
  element.style.cssText = ''
})

describe('setCssVariable', () => {
  it('sets a single css variable on the root element', () => {
    setCssVariable('--color-primary', 'red')

    expect(root().style.getPropertyValue('--color-primary')).toBe('red')
  })

  it('does nothing when the root element is absent', () => {
    const query = vi.spyOn(document, 'querySelector').mockReturnValueOnce(null)

    expect(() => setCssVariable('--space', '4px')).not.toThrow()

    expect(query).toHaveBeenCalledWith(':root')
  })
})

describe('setCssVariables', () => {
  it('sets multiple variables and skips undefined values', () => {
    setCssVariables({
      '--spacing': '8px',
      '--color': 'blue',
      '--skipped': undefined,
    })

    const element = root()
    expect(element.style.getPropertyValue('--spacing')).toBe('8px')
    expect(element.style.getPropertyValue('--color')).toBe('blue')
    expect(element.style.getPropertyValue('--skipped')).toBe('')
  })

  it('returns early when the root element is absent', () => {
    const query = vi.spyOn(document, 'querySelector').mockReturnValueOnce(null)

    setCssVariables({ '--spacing': '12px' })

    expect(query).toHaveBeenCalledWith(':root')
  })
})
