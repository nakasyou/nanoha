import { IconBrush, IconBrushOff, IconEraser, IconEraserOff } from '@tabler/icons-react'
import { useContext, useEffect, useRef, useState } from 'react'
import range from '../utils/range'
import { useWindowSize } from '../utils/useWindowSize'

type DoubleTouple<T> = [T,T]
interface SvgPathCommand {
  cmd: "M" | "L"
  x: number
  y: number
}
export default () => {
  const imageRef = useRef<HTMLImageElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const [scanedFile, setScanedFile] = useState<File | null>(null)
  const [scanedImage, setScanedImage] = useState<HTMLImageElement | null>(null)
  const [sheetSvgViewBox, setSheetSvgViewBox] = useState("")

  const [imageRect, setImageRect] = useState({})
  
  const [sheetSvgPaths, setSheetSvgPaths] = useState<SvgPathCommand[][]>([[
    { cmd: "M", x: 0, y: 0},
    { cmd: "L", x: 100, y: 100}
  ]])
  const renderFlame: [(() => void ) | null] = [null]

  const windowSize = useWindowSize()
  
  const imageSheets: DoubleTouple<number>[][] = []
  const [isPen, setIsPen] = useState(true)
  const pointerData: Record<string, DoubleTouple<number>[]> = {}
  const createSheetSvgData = () => {
    const allRawSheetData = [...imageSheets, ...Object.values(pointerData)]
    const result = allRawSheetData.map(rawSheetData => {
      return rawSheetData.map((position, index): SvgPathCommand => {
        const xy: { x: number, y: number } = { x: position[0], y: position[1] }
        if (index === 0) {
          return { ...xy, cmd: "M"}
        }
        return { ...xy, cmd: "L"}
      })
    })
    setSheetSvgPaths(result)
  }
  const removePointerEvents = () => {
    const svg = svgRef.current!
    svg.onpointerdown = null
    svg.onpointermove = null
    svg.onpointerup = null
    for (const element of svg.children) {
      (element as SVGPathElement).onclick = (evt) => {
        (element as SVGPathElement).setAttribute('display', 'none')
      }
    }
  }
  const setPointerEvents = () => {
    const image = imageRef.current!
    const svg = svgRef.current!
    for (const element of svg.children) {
      (element as SVGPathElement).onclick = null
    }
    svg.onpointerdown = evt => {
      pointerData[evt.pointerId] = []
      createSheetSvgData() 
    }
    svg.onpointermove = evt => {
      if (pointerData[evt.pointerId]) {
        const canvasRect = image.getBoundingClientRect()
        const widthRatio = scanedImage!.width / canvasRect.width
        const heightRaito = scanedImage!.height / canvasRect.height

        console.log(widthRatio,heightRaito )
        const position: DoubleTouple<number> = [widthRatio * (evt.clientX - canvasRect.left), heightRaito * (evt.clientY - canvasRect.top)]
        pointerData[evt.pointerId].push(position)
      }
      createSheetSvgData()  
    }
    svg.onpointerup = evt => {
      imageSheets.push(pointerData[evt.pointerId])
      delete pointerData[evt.pointerId]
      createSheetSvgData()
    }
  }
  useEffect(() => {
    const svg = svgRef.current!
    const image = imageRef.current!
    
    setSheetSvgViewBox(`0 0 ${scanedImage?.width} ${scanedImage?.height}`) // 被せるSVGのサイズ指定
    setPointerEvents()
    if (scanedImage) {
      image.width = scanedImage.width
      image.height = scanedImage.height
      image.src = URL.createObjectURL(scanedFile!)
      setImageRect(image.getBoundingClientRect())
    }
  }, [scanedImage])
  return <>
    <div className="w-full fixed z-20">
      <div className="w-full h-screen bg-[#00000099]">
        <div className="flex justify-center items-center mx-auto my-auto ">
          <div className="bg-background p-4 border border-on-background rounded-xl text-on-background m-4">
            <div>
              <div className="text-2xl">スキャン</div>
            </div>
            <div className="text-center">
              <div>現実世界のノート、プリント等を取り込みましょう!</div>
              { !scanedImage && <div className="my-1">
                <button className="outlined-button" onClick={() => {
                  const input = document.createElement("input")
                  input.hidden = true
                  imageRef.current!.parentElement!.append(input)
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
                    input.remove()
                  }
                  input.click()
                }}>カメラを起動する</button>
              </div> }
              <div>
                {/*
                  scanedImage
                */}
                <div className='relative' style={{
                  width: windowSize.innerHeight - 20,
                  height: windowSize.innerHeight - 200, /*scanedImage.height > windowSize.innerHeight ? 0 : windowSize.innerHeight*/
                }}>
                  <img ref={imageRef} className="absolute w-full h-full object-contain" />
                  <svg viewBox={sheetSvgViewBox} className='absolute touch-none w-full h-full object-contain' ref={svgRef} style={{
                    //bottom: sheetSvgViewBox.replace(/.+ .+ .+ /, "")+  "px"
                  }} >
                    {
                      sheetSvgPaths.map((sheetSvgPath, index) => {
                        return <path key={index} stroke="#f002" strokeWidth="20" fill="none" d={sheetSvgPath.map(({ cmd, x, y }) => {
                          return `${cmd} ${x},${y}`
                        }).join(' ')} />
                      })
                    }
                  </svg>
                </div>
                {/*<div style={{
                  width: imageRect.width,
                  height: imageRect.height,
                }}/>*/}
                {
                  scanedImage && <div>
                    <div className="flex justify-center">
                      <button className="filled-tonal-button" onClick={() => {
                        setIsPen(true)
                        setPointerEvents()
                      }}>
                        { isPen ? <IconBrush /> : <IconBrushOff /> }
                      </button>
                      <button className="filled-tonal-button" onClick={() => {
                        setIsPen(false)
                        removePointerEvents()
                      }}>
                        { !isPen ? <IconEraser /> : <IconEraserOff /> }
                      </button>
                    </div>
                    <div className="flex justify-center">
                      <button className="outlined-button" onClick={() => {
                      }}>
                        完了
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
