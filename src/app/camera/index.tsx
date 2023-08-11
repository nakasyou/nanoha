import React, { useRef, useEffect, useState } from "react"
import { Camera, useCamera } from './utils/Camera.tsx'

export default function () {
  useEffect(() => {
    (async () => {
      try {
      const camera = useCamera({
        width: 1000,
        height: 100,
      })
      alert(camera)
      } catch(e) {alert("error", e)}
      const inputs = await camera.getInputs()
      await camera.startCamera(inputs[0])
    })()
  }, [])
  return <>
    aaa

  </>
}
