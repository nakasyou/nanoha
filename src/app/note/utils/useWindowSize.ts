import { useLayoutEffect, useState } from 'react'

export interface Size {
  interWidth: number
  innerHeight: number
}
export const useWindowSize = (): Size => {
  const [size, setSize] = useState<Size>({
    inneeWidth: 0,
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
