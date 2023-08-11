import { useRef, useEffect, useState } from "react"
import { Camera, useCamera } from './utils/Camera.tsx'

export default function () {
  /*const camera = useCamera({
    width: 1000,
    height: 100,
  })*/
  useEffect(() => {
    (async () => {
      alert("x")
      const inputs = await camera.getInputs()
      await camera.startCamera(inputs[0])
    })()
  }, [])
  return <>
    aaa

  </>
}
