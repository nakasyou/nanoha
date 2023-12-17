import { Show, createSignal } from "solid-js"
import { Dialog, createDialog } from "../../../utils/Dialog"
import EditorCore from "./EditorCoreX"
import type { Sheets } from "./Sheet"

export interface Props {
  onEnd(data: ScanedImageEditedData | null): void
  scanedImage?: Blob
  sheets?: Sheets
}
export interface ScanedImageEditedData {
  sheets: Sheets
  image: Blob
}
export const ScanedImageEditor = (props: Props) => {
  const [scanedImageBlob, setScanedImageBlob] = createSignal<Blob | undefined>(props.scanedImage)
  const dialog = createDialog<boolean>()
  
  const reScan = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.onchange = () => {
      if (!input.files){
        return
      }
      const imageFile = input.files[0]
      setScanedImageBlob(imageFile)
    }
    input.click()
  }
  const [sheets, setSheets] = createSignal<Sheets>(props.sheets ?? [])
  return <Dialog type="custom" dialog={dialog} title="編集" onClose={(result) => {
    const nowScanedImageBlob = scanedImageBlob()
    props.onEnd((result && nowScanedImageBlob) ? {
      sheets: sheets(),
      image: nowScanedImageBlob
    } : null)
  }} class="ml-5">
    <div>
      <Show when={!scanedImageBlob()}>
        <button class="outlined-button" onClick={reScan}>スキャン!</button>
      </Show>
    </div>
    <div>
      <Show when={scanedImageBlob()}>
        <div>
          <EditorCore
            scanedImage={scanedImageBlob()}
            changeSheets={(sheets) => {
              setSheets(sheets)
            }}
            sheets={sheets()}
            />
        </div>
        <div class="flex justify-center gap-5 items-center">
          <button class="outlined-button" onClick={() => dialog.close(false)}>
            キャンセル
          </button>
          <button class="filled-button" onClick={() => dialog.close(true)}>
            完了
          </button>
        </div>
      </Show>
    </div>
  </Dialog>
}
