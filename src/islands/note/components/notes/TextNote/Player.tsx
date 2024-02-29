import { createEffect, createMemo, createSignal } from "solid-js"
import { noteBookState } from "../../../store"
import DOMPurify from "dompurify"

export const Player = (props: { html: string }) => {

  const html = createMemo((): string => {
    let newHtml = DOMPurify.sanitize(props.html)
    //newHtml = newHtml.replace(/class=\"nanoha-sheet/, 'class="nanoha-sheet nanoha-sheet-playing')
    return newHtml
  })
  
  let ref: HTMLDivElement | undefined

  let sheetElements: HTMLSpanElement[]
  createEffect(() => {
    const htmlText = html()

    if (!ref) return

    sheetElements = Array.from(ref.getElementsByClassName('nanoha-sheet')) as HTMLSpanElement[]

    const resetDataset = (element: HTMLSpanElement) => {
      for (const [datsetKey, defaultValue] of Object.entries({
        isHidden: 'false'
      })) {
        if (!element.dataset[datsetKey]) {
          element.dataset[datsetKey] = defaultValue
        }
      }
    }
    const rerenderSheet = (element: HTMLSpanElement) => {
      const dataset = element.dataset as {
        isHidden: 'false' | 'true'
      }
    }
    for (const sheetElement of sheetElements) {
      sheetElement.classList.add('nanoha-sheet-playing')
      resetDataset(sheetElement)
      const dataset = sheetElement.dataset as {
        isHidden: 'false' | 'true'
      }
      
      sheetElement.onclick = () => {
        dataset.isHidden = dataset.isHidden === 'true' ? 'false': 'true'
      }
    }
  })

  createEffect(() => {
    const sheetDefaultState = noteBookState.sheetDefaultState
    for (const sheetElement of sheetElements) {
      sheetElement.dataset.isHidden = sheetDefaultState ? 'false': 'true'
    }
  })
  return (
    <div
      class="p-2 rounded my-2 border border-outlined nanohanote-textnote-styler"
      innerHTML={html()}
      ref={ref}
    />
  )
}
