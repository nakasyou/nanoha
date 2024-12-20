import DOMPurify from 'dompurify'
import { createEffect, createMemo, createSignal, onMount } from 'solid-js'
import { noteBookState } from '../../../store'

export const Player = (props: { html: string }) => {
  const html = createMemo((): string => {
    let newHtml = props.html
    newHtml = DOMPurify.sanitize(newHtml)
    //newHtml = newHtml.replace(/class=\"nanoha-sheet/, 'class="nanoha-sheet nanoha-sheet-playing')
    return newHtml
  })
  let ref: HTMLDivElement | undefined

  let sheetElements: HTMLSpanElement[]
  createEffect(() => {
    const htmlText = html()

    if (!ref) return

    sheetElements = Array.from(
      ref.getElementsByClassName('nanoha-sheet'),
    ) as HTMLSpanElement[]

    const resetDataset = (element: HTMLSpanElement) => {
      for (const [datsetKey, defaultValue] of Object.entries({
        isHidden: 'false',
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
        dataset.isHidden = dataset.isHidden === 'true' ? 'false' : 'true'
      }
    }
  })
  createEffect(() => {
    const sheetDefaultState = noteBookState.sheetDefaultState
    for (const sheetElement of sheetElements) {
      sheetElement.dataset.isHidden = sheetDefaultState ? 'false' : 'true'
    }
  })
  return (
    <div
      class="nanohanote-textnote-styler break-words"
      innerHTML={html()}
      ref={ref}
    />
  )
}
