import { Application, Container, Sprite, Texture } from 'pixi.js'
import { createEffect, onMount } from 'solid-js'

export interface Props {
  scanedImage?: Blob | undefined
}

export default (props: Props) => {
  let canvas!: HTMLCanvasElement
  let canvasContainer!: HTMLDivElement

  const container = new Container()
  const scanedImageSprite = new Sprite()
  container.addChild(scanedImageSprite)

  const position = {
    x: 0,
    y: 0
  }
  onMount(() => {
    const app = new Application({
      backgroundColor: 0x000000,
      view: canvas,
      resizeTo: canvasContainer
    })
    
    app.stage.addChild(container)

    let scale = 1
    canvas.addEventListener('wheel', ev => {
      scale *= ev.deltaY < 0 ? 1.1 : 0.9 
      container.scale.set(scale, scale)
      console.log(ev.deltaZ)
    })

    const resize = () => {
      container.position.set(position.x + canvas.width / 2, position.y + canvas.height / 2)
    }
    const observer = new MutationObserver(resize)
    observer.observe(canvas, {
      attributes: true,
      attributeFilter: ["width", "height"]
    })
  })

  createEffect(() => {
    if (!props.scanedImage) {
      return
    }
    const blobImageUrl = URL.createObjectURL(props.scanedImage)

    const image = new Image()
    image.onload = () => {
      container.pivot.set(image.width / 2, image.height / 2)
      container.position.set(image.width / 2, image.height / 2)

      //container.width = image.width
      //container.height = image.height
    }
    image.src = blobImageUrl

    const texture = Texture.from(blobImageUrl)

    scanedImageSprite.texture = texture
  })
  return <div>
    <div ref={canvasContainer} class="w-full h-96">
      <canvas ref={canvas} />
    </div>
  </div>
}
