import { useRef, useEffect } from "react"

export default function () {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    (async () => {
      if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
        // カメラ使えない
        alert('お使いのデバイスには、ウェブカメラ機能が搭載されていません...')
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true }).catch(() => alert('カメラへのアクセスを許可してください'))
      videoRef.current.srcObject = stream
      videoRef.current?.play()
      const ctx = canvasRef.current.getContext('2d')
      setInterval(() => {
        ctx.drawImage(videoRef.current, 1000, 1000)
      }, 10)
    })()
  }, [])

  return <>
    <video width="1000" height="1000" autoplay ref={videoRef} />
    <canvas width="1000" height="1000" ref={canvasRef} />
    Hello camera!
  </>
}
