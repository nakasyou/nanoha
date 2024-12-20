import { Show, createEffect } from 'solid-js'
import type { SetStoreFunction } from 'solid-js/store'
import { Dialog, createDialog } from '../../../utils/Dialog'
import type { ImageNoteData } from '../types'
import EditorCore from './EditorCore'
import type { Sheets } from './Sheet'

export interface Props {
  onEnd(data: ScanedImageEditedData | null): void
  noteData: ImageNoteData
  setNoteData: SetStoreFunction<ImageNoteData>
}
export interface ScanedImageEditedData {
  sheets: Sheets
  image: Blob
}
export const ScanedImageEditor = (props: Props) => {
  const dialog = createDialog<boolean>()

  let scanInputRef!: HTMLInputElement

  const reScan = () => {
    scanInputRef.oninput = () => {
      if (!scanInputRef.files) {
        return
      }
      const imageFile = scanInputRef.files[0]
      if (!imageFile) {
        return
      }
      props.setNoteData('blobs', 'scanedImage', imageFile)
    }
    scanInputRef.click()
  }
  return (
    <Dialog
      type="custom"
      dialog={dialog}
      title="編集"
      onClose={(result) => {
        const nowScanedImageBlob = props.noteData.blobs.scanedImage
        props.onEnd(
          result && nowScanedImageBlob
            ? {
                sheets: props.noteData.canToJsonData.sheets,
                image: nowScanedImageBlob,
              }
            : null,
        )
      }}
      class="ml-5"
    >
      <input ref={scanInputRef} type="file" class="hidden" />
      <div>
        <Show when={!props.noteData.blobs.scanedImage}>
          <button class="outlined-button" onClick={reScan} type="button">
            スキャン!
          </button>
        </Show>
      </div>
      <div>
        {props.noteData.blobs.scanedImage && (
          <>
            <div>
              <EditorCore
                scanedImage={props.noteData.blobs.scanedImage}
                changeSheets={(sheets) => {
                  props.setNoteData('canToJsonData', 'sheets', sheets)
                }}
                sheets={props.noteData.canToJsonData.sheets}
                rescan={() => {
                  props.setNoteData('canToJsonData', 'sheets', [])
                  props.setNoteData('blobs', 'scanedImage', undefined)
                }}
              />
            </div>
            <div class="flex justify-center gap-5 items-center">
              <button
                class="outlined-button"
                onClick={() => dialog.close(false)}
                type="button"
              >
                キャンセル
              </button>
              <button
                class="filled-button"
                onClick={() => dialog.close(true)}
                type="button"
              >
                完了
              </button>
            </div>
          </>
        )}
      </div>
    </Dialog>
  )
}
