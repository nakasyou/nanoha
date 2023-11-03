import { Show, createSignal } from "solid-js"
import { Dialog, createDialog } from "../../../utils/Dialog"

export interface Props {
  onEnd(): void
  scanedImage?: Blob
}
export const ScanedImageEditor = (props: Props) => {
  const [scanedImageBlob, setScanedImageBlob] = createSignal<Blob | undefined>(props.scanedImage)
  const dialog = createDialog()
  
  const reScan = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.click()
  }

  return <Dialog type="custom" dialog={dialog} title="編集" onClose={(result) => {
    props.onEnd()
  }}>
    <div>
      <Show when={!scanedImageBlob()}>
        <button class="outlined-button" onClick={reScan}>スキャン!</button>
      </Show>
    </div>
  </Dialog>
}
