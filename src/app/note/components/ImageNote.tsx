import { UserStateContext } from "../index.tsx"
import { viewClasses, hideClasses } from '../const/sheetClasses.ts'

import {

} from "@tabler/icons-react"
import { useEffect, useRef, useContext } from "react"
import classNames from "classnames"

export interface Props {
  imageBlob: Blob
  paths: string[]
}
export default const ImageNote = (props: Props) => {
  const userState = useContext(UserStateContext)
  const blobUrl = URL.createObjectURL(props.imageBlob)

  const [viewbox, setViewBox] = useState('0 0 0 0')
  
  const image = new Image()
  image.onload = () => {
    setViewbox(`0 0 ${image.width} ${image.height}`)
  }
  image.src = blobUrl
  return <div>
    <div className='relative'>
      <img className='absolute top-0' src={ blobUrl } alt='Scaned Image' />
      <svg className='absolute top-0' viewbox={ viewbox }>
        {
          props.paths.map((path, index) => {
            return <path d={ path } key={ index } stroke="#f002" strokeWidth="20" fill="none" />
          })
        }
      </svg>
    </div>
  </div>
}
