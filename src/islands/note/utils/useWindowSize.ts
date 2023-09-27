import { useLayoutEffect, useState } from 'react'

export interface Size {
  innerWidth: number
  innerHeight: number
}
export const useWindowSize = (): Size => {
  const [size, setSize] = useState<Size>({
    innerWidth: 0,
    innerHeight: 0,
  })
  useLayoutEffect(() => {
    const updateSize = () => {
      setSize({
        innerWidth: window.innerWidth, 
        innerHeight: window.innerHeight,
      })
    }

    window.addEventListener('resize', updateSize)
    updateSize()
  }, [])
  return size
};
