import { useState, useEffect, useRef } from 'react'

export interface CameraContext {
  getInputs: () => Promise<string[]>
  startCamera: (deviceId?: string) => Promise<void>
  getVideoElement: () => HTMLVideoElement
  size: {
    width: number
    height: number
  }
}
export interface UseCameraInit {
  width: number
  height: number
}
export const useCamera = (init: UseCameraInit): CameraContext => {
  const videoRef = useRef(document.createElement('video'))
  videoRef.current.autoplay = true
  videoRef.current.width = init.width
  videoRef.current.height = init.height
  return {
    async getInputs () {
      return (await navigator.mediaDevices.enumerateDevices()).filter(device => device.kind === 'videoinput').map(device => device.deviceId)
    },
    async startCamera (deviceId?: string) {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId,
        }
      })
      videoRef.current.srcObject = stream
      videoRef.current.play()
    },
    getVideoElement () {
      return videoRef.current
    },
    size: {
      width: init.width,
      height: init.height
    }
  }
}
export interface CameraProps {
  cameraContext: CameraContext
}
export const Camera = (props: CameraProps) => {
  const videoElement = props.cameraContext.getVideoElement()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d')
    setInterval(() => {
      ctx.drawImage(videoElement, 0, 0)
    }, 10)
  }, [])
  return <canvas width={props.cameraContext.size.width} height={props.cameraContext.size.height} ref={canvasRef} />
}
