import { UserStateContext } from "../index.tsx"
import { viewClasses, hideClasses } from '../const/sheetClasses.ts'

import {

} from "@tabler/icons-react"
import { useEffect, useRef, useContext, useState } from "react"
import classNames from "classnames"
import { classListAddAll, classListRemoveAll } from "../utils/classListAll.ts"

interface SheetProps {
  path: string
  userState: {
    isView: string
  }
}
const Sheet = (props: SheetProps) => {
  const ref = useRef(document.createElement(path))

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
    ref.current.dataset.isView = props.userState.isView
    reset()
  }, [props.userState.isView])
  return <path d={ props.path } stroke="#f002" strokeWidth="20" fill="none" ref={ref} onClick={(evt) => {
    const pathElement: SVGPathElement = evt.target as SVGPathElement
    const nextIsView = pathElement.dataset.isView !== 'true'
    pathElement.dataset.isView = nextIsView.toString()
    reset()
   }} />
}

export interface Props {
  imageBlob: Blob
  paths: string[]
}
export default (props: Props) => {
  const userState = useContext(UserStateContext)

  const [imageSize, setImageSize] = useState({
    width: 1,
    height: 1,
  })
  const [blobUrl, setBlobUrl] = useState('')
  const svgRef = useRef<SVGSVGElement>(null)
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
    for (const pathElement of svgRef.current.children) {
      pathElement.dataset.isView = (!userState.isView).toString()
      pathElement.dispatchEvent(new MouseEvent('click'))
    }
  }, [userState.isView])
  return <div className="p-4 rounded-md border">
    <div className='relative w-full h-screen'>
      <img className='absolute top-0 w-full h-full object-contain' src={ blobUrl } alt='Scaned Image' />
      <svg className='absolute top-0 w-full h-full object-contain' viewBox={ `0 0 ${imageSize.width} ${imageSize.height}` } ref={svgRef}>
        {
          props.paths.map((path, index) => {
            return <Sheet path={path} />
          })
        }
      </svg>
    </div>
  </div>
}
