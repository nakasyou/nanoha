import { Show, createEffect, createResource, createSignal } from 'solid-js'
import type { Sheets } from './Sheet'
import Sheet from './Sheet'

const getImageElementByUrl = (url: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
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
  createEffect(() => {
    getImageElementByUrl(props.imageUrl)
      .then(elem => {
        console.log(elem)
        setImageElement(elem)
      })
  })
  
  return <div>
    <div class="relative origin-top-left" style={{
      width: getImageElement().width + 'px',
      height: getImageElement().height + 'px',
      transform: ``
    }}>
      <div class="absolute top-0 left-0">
        <img class="pointer-events-none select-none" src={props.imageUrl} alt='image' />
      </div>
      <div class="absolute top-0 left-0">
        <Sheet
          isPlayMode={!props.viewMode}
          sheets={props.sheetsData}
          onClickSheet={() => null}
          width={getImageElement().width}
          height={getImageElement().height} />
      </div>
    </div>
  </div>
}
