import {
  Show,
  createEffect,
  createResource,
  createSignal,
  onMount,
} from 'solid-js'
import { noteBookState } from '../../../../store'
import type { Sheets } from './Sheet'
import Sheet from './Sheet'

const getImageElementByUrl = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const result = new Image()
    result.onload = () => {
      resolve(result)
    }
    result.onerror = reject
    result.src = url
  })
export default (props: {
  imageUrl: string
  imageBlob: Blob
  sheetsData: Sheets

  viewMode: boolean
}) => {
  const [getImageElement, setImageElement] = createSignal(new Image())
  const [getImageRect, setImageRect] = createSignal(new DOMRect())
  let imgRef!: HTMLImageElement
  createEffect(() => {
    getImageElementByUrl(props.imageUrl).then((elem) => {
      setImageElement(elem)
    })
  })
  onMount(() => {
    setImageRect(imgRef.getBoundingClientRect())
    const observer = new ResizeObserver(() => {
      setImageRect(imgRef.getBoundingClientRect())
    })
    observer.observe(imgRef)
  })

  return (
    <div class="">
      <div class="relative origin-top-left">
        <img
          class="pointer-events-none select-none w-full h-full"
          src={props.imageUrl}
          alt="scaned"
          ref={imgRef}
        />
        <div class="absolute top-0 left-0 w-full h-full">
          <Sheet
            isPlayMode={!props.viewMode}
            sheets={props.sheetsData}
            onClickSheet={() => null}
            width={getImageElement().width}
            height={getImageElement().height}
            class="w-full h-full"
          />
        </div>
      </div>
    </div>
  )
}
