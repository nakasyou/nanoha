import { Application, Container, Graphics, Sprite, Texture } from 'pixi.js'
import { createEffect, onMount, onCleanup, createSignal } from 'solid-js'

export interface Props {
  scanedImage?: Blob | undefined
}

export default (props: Props) => {
  const [editMode, setEditMode] = createSignal<'move' | 'paint'>('move')
  let canvas!: HTMLCanvasElement
  let canvasContainer!: HTMLDivElement

  const container = new Container()
  const scanedImageSprite = new Sprite()
  container.addChild(scanedImageSprite)

  const sheets = new Container()
  container.addChild(sheets)

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
      const hadSheetByPointers: Record<string, {
        sheet: Graphics
      }> = {}

      const sheet = new Graphics()
        .beginFill(0xff00ff)
        .lineStyle(4, 0xff00ff, 1)
        .moveTo(0, 0)
        .lineTo(10, 10)
        .lineStyle(4, 0xff00ff, 1)
      sheets.addChild(sheet)

      app.stage.addEventListener('pointerdown', evt => {
        pointerDatas[evt.pointerId] = {
          x: evt.screenX,
          y: evt.screenY,
          deltaX: 0,
          deltaY: 0
        }

        hadSheetByPointers[evt.pointerId] ={
          sheet
        }
      })
      let lastDistanseFor2 = 0
      app.stage.on('pointermove', evt => {
        const lastPointerEvent = pointerDatas[evt.pointerId]
        if (!lastPointerEvent) {
          return
        }
        const deltaX = evt.screenX - lastPointerEvent.x
        const deltaY = evt.screenY - lastPointerEvent.y
        if (editMode() === 'move') {
          container.position.x += deltaX
          container.position.y += deltaY
  
          if (Object.keys(pointerDatas).length > 1) {
            const pointerEntries = Object.entries(pointerDatas)
            
            const pointer0 = pointerEntries[0][1]
            const pointer1 = pointerEntries[1][1]
  
            const distanceX = pointer0.x - pointer1.x
            const distanceY = pointer0.y - pointer1.y
  
  
            const distanceXy = Math.sqrt(distanceX ** 2 + distanceY ** 2)
  
            scale /= (lastDistanseFor2 / (distanceXy || 1)) || 1
  
            console.log((lastDistanseFor2 / (distanceXy || 1)))
            lastDistanseFor2 = distanceXy
            container.scale.set(scale, scale)
          }
        } else if (editMode() === 'paint') {
          const thisPointerSheet = hadSheetByPointers[evt.pointerId]
          if (thisPointerSheet) {
            thisPointerSheet.sheet.lineTo(evt.globalX, evt.globalY)
              .moveTo(evt.globalX, evt.globalY)
              .lineStyle(4, 0xff00ff, 1)
          }
        }
        pointerDatas[evt.pointerId] = {
          x: evt.screenX,
          y: evt.screenY,
          deltaX,
          deltaY,
        }
      })
      canvas.addEventListener('pointerup', evt => {
        lastDistanseFor2 = 0
        delete pointerDatas[evt.pointerId]
        hadSheetByPointers[evt.pointerId].sheet.closePath().endFill()
        delete hadSheetByPointers[evt.pointerId]
      })
      canvas.addEventListener('pointercancel', evt => {
        delete pointerDatas[evt.pointerId]
      })
      canvas.addEventListener('pointerout', evt => {
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
    <div ref={canvasContainer} class="w-full h-[calc(100dvh-200px)]">
      <canvas ref={canvas} />
    </div>
    <div class="my-2 flex">
      <button class="grid hover:drop-shadow drop-shadow-none disabled:drop-shadow-none disabled:bg-gray-100 rounded-full p-1 bg-white border"
        onClick={() => {
          setEditMode('move')
        }}
        disabled={editMode() === 'move'}>
        <div innerHTML={'move'} class="w-8 h-8" />
      </button>
      <button class="grid hover:drop-shadow drop-shadow-none disabled:drop-shadow-none disabled:bg-gray-100 rounded-full p-1 bg-white border"
        onClick={() => {
          setEditMode('paint')
        }}
        disabled={editMode() === 'paint'}>
        <div innerHTML={'paint'} class="w-8 h-8" />
      </button>
    </div>
  </div>
}
