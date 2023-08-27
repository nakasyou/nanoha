import { UserStateContext } from "../index.tsx"
import { viewClasses, hideClasses } from '../const/sheetClasses.ts'

import {

} from "@tabler/icons-react"
import { useEffect, useRef, useContext, useState } from "react"
import classNames from "classnames"

export interface Props {
  imageBlob: Blob
  paths: string[]
}
export default (props: Props) => {
  const userState = useContext(UserStateContext)
  const blobUrl = URL.createObjectURL(props.imageBlob)

  const [imageSize, setImageSize] = useState({
    width: 1,
    height: 1,
  })
  
  const image = new Image()
  image.onload = () => {
    setImageSize({
      width: image.width,
      height: image.height
    })
  }
  image.src = blobUrl
  return <div>
    <div className='relative w-full h-screen'>
      <img className='absolute top-0 w-full h-full object-contain' src={ blobUrl } alt='Scaned Image' />
      <svg className='absolute top-0 w-full h-full object-contain' viewbox={ `0 0 ${imageSize.width} ${imageSize.height}` }>
        {
          props.paths.map((path, index) => {
            return <path d={ path } key={ index } stroke="#f002" strokeWidth="20" fill="none" />
          })
        }
      </svg>
    </div>
  </div>
}
