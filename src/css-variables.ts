export const setCssVariable = (property: string, value: string): void => {
  const root = document.querySelector(':root') as HTMLElement
  if (root) {
    root.style.setProperty(property, value)
  }
}

export const setCssVariables = (variables: Record<string, string | undefined>): void => {
  const root = document.querySelector(':root') as HTMLElement
  if (!root) return

  Object.entries(variables).forEach(([property, value]) => {
    if (value !== undefined) {
      root.style.setProperty(property, value)
    }
  })
}
