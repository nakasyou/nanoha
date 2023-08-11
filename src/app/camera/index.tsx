import { useRef } from "react"

export default function () {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  useEffect(() => {
    (async () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // カメラ使えない
        alert('お使いのデバイスには、ウェブカメラ機能が搭載されていません...')
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true }).catch(() => alert('カメラへのアクセスを許可してください'))
      videoRef.current.srcObject = stream
      videoRef.current?.play()
    })()
  }, [])

  return <>
    <video width="1000" height="1000" autoplay ref={videoRef} />
    Hello camera!
  </>
}
