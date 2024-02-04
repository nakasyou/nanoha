import { createEffect, createMemo, createSignal } from "solid-js"

export const Player = (props: { html: string }) => {

  const html = createMemo((): string => {
    let newHtml = props.html
    //newHtml = newHtml.replace(/class=\"nanoha-sheet/, 'class="nanoha-sheet nanoha-sheet-playing')
    return newHtml
  })
  
  let ref: HTMLDivElement | undefined

  createEffect(() => {
    const htmlText = html()

    if (!ref) return

    const sheetElements = Array.from(ref.getElementsByClassName('nanoha-sheet'))
    
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
    for (const sheetElement of sheetElements as HTMLSpanElement[]) {
      /*if (!(sheetElement instanceof HTMLSpanElement)) {
        continue
      }*/ 
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
  return (
    <div
      class="bg-on-tertiary p-2 rounded my-2 border boader-outlined nanohanote-textnot-styler"
      innerHTML={html()}
      ref={ref}
    />
  )
}
