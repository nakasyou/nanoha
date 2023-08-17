import { IconBrush, IconBrushOff, IconEraser, IconEraserOff } from '@tabler/icons-react'
import { useContext, useEffect, useRef, useState } from 'react'
import range from '../utils/range'

type DoubleTouple<T> = [T,T]
export default () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [scanedFile, setScanedFile] = useState<File | null>(null)
  const [scanedImage, setScanedImage] = useState<HTMLImageElement | null>(null)
  const [sheetSvgViewBox, setSheetSvgViewBox] = useState("")

  const renderFlame: [(() => void ) | null] = [null]
  
  const imageSheets: DoubleTouple<number>[][] = []
  const [paintTools, setPaintTools] = useState({
    pen: true,
    eraser: false,
  })

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const pointerData: Record<string, DoubleTouple<number>[]> = {}

    setSheetSvgViewBox(`0 0 ${scanedImage?.width} ${scanedImage?.height}`) // 被せるSVGのサイズ指定
    canvas.onpointerdown = evt => {
      pointerData[evt.pointerId] = []
    }
    canvas.onpointermove = evt => {
      if (pointerData[evt.pointerId]) {
        const canvasRect = canvas.getBoundingClientRect()

        const position: DoubleTouple<number> = [evt.clientX - canvasRect.left, evt.clientY - canvasRect.top]
        pointerData[evt.pointerId].push(position)
      }
    }
    canvas.onpointerup = evt => {
      imageSheets.push(pointerData[evt.pointerId])
      delete pointerData[evt.pointerId]
    }
    if (scanedImage) {
      canvas.width = scanedImage.width
      canvas.height = scanedImage.height
    }

    renderFlame[0] = () => {
      if (scanedImage) {
        ctx.drawImage(scanedImage!, 0, 0)
      }
      ctx.strokeStyle = "#f002"
      ctx.lineWidth = 10
      for (const imageSheet of [...imageSheets, ...Object.values(pointerData)]) {
        ctx.beginPath()
        for (const position of imageSheet) {
          ctx.lineTo(...position)
        }
        ctx.stroke()
      }
      if (renderFlame[0]) {
        window.requestAnimationFrame(renderFlame[0])
      }
    }
    renderFlame[0]()
  }, [scanedImage])
  return <>
    <div className="w-full fixed z-20 ">
      <div className="w-full h-screen bg-[#00000099]">
        <div className="flex justify-center items-center mx-auto my-auto ">
          <div className="bg-background p-4 border border-on-background rounded-xl text-on-background">
            <div>
              <div className="text-2xl">スキャン</div>
            </div>
            <div className="text-center">
              <div>現実世界のノート、プリント等を取り込みましょう!</div>
              { !scanedImage && <div className="my-1">
                <button className="outlined-button" onClick={() => {
                  const input = document.createElement("input")
                  input.type = 'file'
                  input.accept = 'image/*'
                  input.capture = 'environment'
                  input.onchange = (evt) => {
                    if (input.files) {
                      setScanedFile(input.files[0])
                      const image = new Image()   
                      image.onload = () => {
                        setScanedImage(image)
                      }
                      image.src = URL.createObjectURL(input.files[0])
                    } else {
                      alert('データがありません。')
                    }
                  }
                  input.click()
                }}>カメラを起動する</button>
              </div> }
              <div>
                <div className='relative'>
                  <canvas ref={canvasRef} className="absolute" />
                  <svg viewBox={sheetSvgViewBox} className='absolute' style={{
                    //bottom: sheetSvgViewBox.replace(/.+ .+ .+ /, "")+  "px"
                  }} >

                  </svg>
                </div>
                <div style={{
                  width: scanedImage?.width,
                  height: scanedImage?.height
                }}/>
                {
                  scanedImage && <div>
                    <div className="flex justify-center">
                      <button className="filled-tonal-button" onClick={() => {
                        setPaintTools({
                          pen: true,
                          eraser: false,
                        })
                      }}>
                        { paintTools.pen ? <IconBrush /> : <IconBrushOff /> }
                      </button>
                      <button className="filled-tonal-button" onClick={() => {
                        setPaintTools({
                          pen: false,
                          eraser: true,
                        })
                      }}>
                        { paintTools.eraser ? <IconEraser /> : <IconEraserOff /> }
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
}