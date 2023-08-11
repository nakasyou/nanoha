import { useRef, useEffect, useState } from "react"

export default function () {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cameraStream, setCameraStream] = useState(null)
  useEffect(() => {
    (async () => {
      if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
        // カメラ使えない
        alert('お使いのデバイスには、ウェブカメラ機能が搭載されていません...')
      }
      setCameraStream(await navigator.mediaDevices.getUserMedia({ video: true }).catch(() => alert('カメラへのアクセスを許可してください')))
      
      const video = document.createElement('video')
      video.width = 1000
      video.height = 1000
      video.autoplay = true
      video.srcObject = cameraStream
      video.play()
      const ctx = canvasRef.current.getContext('2d')
      setInterval(() => {
        ctx.drawImage(video, 0, 0)
      }, 10)
    })()
  }, [])

  return <>
    <canvas width="1000" height="1000" ref={canvasRef} />
    Hello camera!
  </>
}
