import type { NoteComponent, NoteComponentProps } from "../../notes-utils"
import { type SetStoreFunction } from "solid-js/store"
import type { ImageNoteData } from "./types"
import { Show, createMemo, createSignal } from "solid-js"

import { Dialog } from "../../utils/Dialog"
import { Controller } from "../../note-components/Controller"
import { noteBookState, setNoteBookState } from "../../../store"
import { ScanedImageEditor } from "./components/ScanedImageEditor"
import Player from "./components/Player"

export interface Props extends NoteComponentProps {
  noteData: ImageNoteData
  setNoteData: SetStoreFunction<ImageNoteData>
}

export const ImageNote = ((props: Props) => {
  const [isActive, setIsActive] = createSignal(false)
  const [isShowCloseDialog, setIsShowCloseDialog] = createSignal(false)

  props.on('focus', (evt) => {
    setIsActive(evt.isActive)
  })
  const imageUrl = createMemo(() => {
    const nowImageBlob = props.noteData.blobs.scanedImage
    return nowImageBlob ? URL.createObjectURL(nowImageBlob) : null
  })
  const [isShowEditor, setIsShowEditor] = createSignal(false)
  return <div onClick={() => {
    props.focus()
    if (noteBookState.isEditMode) {
      setIsShowEditor(true)
    }
  }}>
    <Show when={isShowCloseDialog()}>
      <Dialog onClose={(result) => {
        if (result) {
          // 消していいいらしい
          props.removeNote()
        }
        setIsShowCloseDialog(false)
      }} type="confirm" title="削除しますか?">
        ノートを削除すると、元に戻せなくなる可能性があります。
      </Dialog>
    </Show>
    <Show when={isShowEditor()}>
      <ScanedImageEditor onEnd={(data) => {
        setIsShowEditor(false)
        if (!data) {
          return
        }
        props.setNoteData('blobs', 'scanedImage', data.image)
        props.setNoteData('canToJsonData', 'sheets', data.sheets)
      }} noteData={props.noteData} setNoteData={props.setNoteData} />
    </Show>

    {/* 本体 */}
    <div class="p-2 rounded border my-2 bg-white">
      <Show when={props.noteData.blobs.scanedImage && props.noteData.canToJsonData.sheets} fallback={
        // 画像がない場合
        <Show when={noteBookState.isEditMode} fallback={
          // 画像がないplayモード
          <div>Nothing image...</div>
        }>
          {/* 画像がない編集モード */}
          <div class="text-center">
            <div class="text-xl">ImageNote</div>
            <div>まだスキャンされていません</div>
            <div class="my-2 flex justify-center">
              <button class="outlined-button" onClick={() => {
                setIsShowEditor(true)
              }}>スキャン</button>
            </div>
          </div>
        </Show>
      }>
        {/* 画像がある */}
        <Player
          imageBlob={props.noteData.blobs.scanedImage!!!}
          sheetsData={props.noteData.canToJsonData.sheets!!!}
          imageUrl={imageUrl()!!!}
          viewMode={noteBookState.isEditMode} />
      </Show>
    </div>
    <Show when={noteBookState.isEditMode && isActive()}>
      <div class="flex justify-center gap-5">
        <Controller
          noteIndex={props.index}
          notesLength={props.notes.length}

          onRemove={() => setIsShowCloseDialog(true)}
          onUpNote={() => props.up()}
          onDownNote={() => props.down()}/>
      </div>
    </Show>
  </div>
}) satisfies NoteComponent
