import { UserStateContext } from "../index.tsx"
import { viewClasses, hideClasses } from '../const/sheetClasses.ts'
import ScanDialog from "./ScanDialog.tsx"
import {

} from "@tabler/icons-react"
import { useEffect, useRef, useContext, useState } from "react"
import classNames from "classnames"
import { classListAddAll, classListRemoveAll } from "../utils/classListAll.ts"
import type { SvgPathCommand } from "./ScanDialog.tsx"

interface SheetProps {
  path: string
  userState: {
    isView: boolean
    mode: 'edit' | 'play'
  }
}
const Sheet = (props: SheetProps) => {
  const ref = useRef(document.createElement('path'))

  const reset = () => {
    const pathElement = ref.current
    if (pathElement.dataset.isView === "true") {
      classListAddAll(pathElement, viewClasses)
      classListRemoveAll(pathElement, hideClasses)
    } else {
      classListAddAll(pathElement, hideClasses)
      classListRemoveAll(pathElement, viewClasses)
    }
  }
  useEffect(() => {
    ref.current.dataset.isView = props.userState.isView.toString()
    reset()
  }, [props.userState.isView])
  useEffect(() => {
    ref.current.dataset.isView = 'true'
    reset()
  }, [ref])
  return <path d={ props.path } stroke="#f002" strokeWidth="20" fill="none" ref={ref} onClick={(evt) => {
    if (props.userState.mode === 'play') {     
      const pathElement: SVGPathElement = evt.target as SVGPathElement
      const nextIsView = pathElement.dataset.isView !== 'true'
      pathElement.dataset.isView = nextIsView.toString()
      reset()
    }
   }} />
}

export interface Props {
  imageBlob: Blob
  paths: string[]
  sheetSvgPaths: SvgPathCommand[][]
}
export default (props: Props) => {
  const userState = useContext(UserStateContext)

  const [imageSize, setImageSize] = useState({
    width: 1,
    height: 1,
  })
  const [blobUrl, setBlobUrl] = useState('')
  const svgRef = useRef<SVGSVGElement>(null)
  const [isRescan, setIsRescan] = useState(false)
  useEffect(() => {
    const blobUrl = URL.createObjectURL(props.imageBlob)
    const image = new Image()
    image.onload = () => {
      setImageSize({
        width: image.width,
        height: image.height
      })
    }
    setBlobUrl(blobUrl)
    image.src = blobUrl
  }, [])
  useEffect(() => {
    for (const pathElement of [...svgRef.current!.children] as SVGPathElement[]) {
      pathElement.dataset.isView = (!userState.isView).toString()
      pathElement.dispatchEvent(new MouseEvent('click'))
    }
  }, [userState.isView])

  const [sheetSvgPaths, setSheetSvgPaths] = useState(props.sheetSvgPaths)
  const [paths, setPaths] = useState(props.paths)
  return <>
    <div className="p-4 rounded-md border">
      {
        ((userState.mode === 'edit') && isRescan) && <ScanDialog onClose={(data) => {
          if (!data.failed) {
            setSheetSvgPaths(data.sheetSvgPaths)
            setPaths(data.paths)
          }
          setIsRescan(false)
        }} data={{
          imageBlob: props.imageBlob,
          paths: paths,
          width: 0,
          height: 0,
          sheetSvgPaths: sheetSvgPaths
        }}/>
      }
      <div className='relative w-full h-screen'  onClick={() => {
        setIsRescan(userState.mode === 'edit')
      }}>
        <img className='absolute top-0 w-full h-full object-contain' src={ blobUrl } alt='Scaned Image' />
        <svg className='absolute top-0 w-full h-full object-contain' viewBox={ `0 0 ${imageSize.width} ${imageSize.height}` } ref={svgRef}>
          {
            paths.map((path, index) => {
              return <Sheet path={path} userState={userState} key={index} />
            })
          }
        </svg>
      </div>
    </div>
  </>
}
