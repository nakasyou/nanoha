import { useState, useEffect } from 'react'

export const useActiveElement = () => {
  const [activeElement, setActiveElement] = useState<Element | null>(null)
  useEffect(() => setActiveElement(document.activeElement), [document.activeElement])
  return activeElement
}
