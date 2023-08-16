import { IconBrush, IconBrushOff } from '@tabler/icons-react'
import { useContext, useEffect, useRef, useState } from 'react'

export default () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [scanedFile, setScanedFile] = useState<File | null>(null)
  const [scanedImage, setScanedImage] = useState<HTMLImageElement | null>(null)
  const [renderFlame, setRenderFlame] = useState<(() => void ) | null>(null)
  
  const paintTools = useState({
    pen: false,
  })
  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    
    if (scanedImage) {
      canvas.width = scanedImage.width
      canvas.height = scanedImage.height
    }

    setRenderFlame(() => {
      window.requestAnimationFrame(() => {
        if (scanedImage) {
          ctx.drawImage(scanedImage!, 0, 0)
        }
        if (renderFlame) {
          renderFlame()
        }
      })
    })
  }, [scanedImage])
  return <>
    <div className="w-full fixed z-20">
      <div className="w-full h-screen">
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
                <canvas ref={canvasRef} />
                {
                  scanedImage && <div>
                    <div className="flex justify-center">
                      <button className="filled-tonal-button">
                        { paintTools.pen ? <IconBrush /> : <IconBrushOff /> }
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