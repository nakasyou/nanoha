import { Application, Container, Sprite, Texture } from 'pixi.js'
import { createEffect, onMount, onCleanup } from 'solid-js'

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

    const resize = () => {
      container.position.set(position.x + canvas.width / 2, position.y + canvas.height / 2)
    }
    const observer = new MutationObserver(resize)
    observer.observe(canvas, {
      attributes: true,
      attributeFilter: ["width", "height"]
    })
    resize()

    app.stage.eventMode = 'static'
    app.stage.hitArea = app.screen

    container.eventMode = 'static'

    let scale = 1

    /**
     * Set Pointer Handler
     */
    ;(() => {
      const pointerDatas: Record<string, {
        x: number
        y: number
        deltaX: number
        deltaY: number
      }> = {}

      container.on('pointerdown', evt => {
        pointerDatas[evt.pointerId] = {
          x: evt.screenX,
          y: evt.screenY,
          deltaX: 0,
          deltaY: 0
        }
      })
      let lastDistanseFor2 = 0
      container.on('pointermove', evt => {
        const lastPointerEvent = pointerDatas[evt.pointerId]

        const deltaX = evt.screenX - lastPointerEvent.x
        const deltaY = evt.screenY - lastPointerEvent.y

        container.position.x += deltaX
        container.position.y += deltaY

        if (Object.keys(pointerDatas).length > 1) {
          const pointerEntries = Object.entries(pointerDatas)
          
          const pointer0 = pointerEntries[0][1]
          const pointer1 = pointerEntries[1][1]

          const distanceX = pointer0.x - pointer1.x
          const distanceY = pointer0.y - pointer1.y

          const distanceXy = Math.sqrt(distanceX ** 2 + distanceY ** 2)

          scale *= (lastDistanseFor2 / (distanceXy || 1))

          lastDistanseFor2 = distanceXy
          container.scale.set(scale, scale)
        }
        pointerDatas[evt.pointerId] = {
          x: evt.screenX,
          y: evt.screenY,
          deltaX,
          deltaY,
        }
      })
      container.on('pointerup', evt => {
        delete pointerDatas[evt.pointerId]
      })
      container.on('pointercancel', evt => {
        delete pointerDatas[evt.pointerId]
      })
      container.on('pointerout', evt => {
        delete pointerDatas[evt.pointerId]
      })
    })()
    canvas.addEventListener('wheel', evt => {
      scale *= evt.deltaY < 0 ? 1.1 : 0.9
      container.scale.set(scale, scale)
    })
    onCleanup(() => {
      app.destroy()
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
