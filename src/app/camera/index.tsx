import { useRef } from "react"

export default function () {
  const videoRef = useRef<HTMLVideoElement>(null)
  return <>
   Hello camera!
  </>
}
