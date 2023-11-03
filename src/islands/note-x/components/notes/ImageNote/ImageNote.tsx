import type { NoteComponent, NoteComponentProps } from "../../Notes"
import { type SetStoreFunction } from "solid-js/store"
import { createEditorTransaction, createTiptapEditor } from 'solid-tiptap'
import StarterKit from '@tiptap/starter-kit'
import type { ImageNoteData } from "./types"
import { Match, Show, Switch, createEffect, createSignal } from "solid-js"
import { removeIconSize } from "../../../utils/icon/removeIconSize"

import IconNote from '@tabler/icons/note.svg?raw'
import IconNoteOff from '@tabler/icons/note-off.svg?raw'

import type { Editor } from "@tiptap/core"
import { Dialog } from "../../utils/Dialog"
import { Controller } from "../../note-components/Controller"
import { noteBookState, setNoteBookState } from "../../../App"
import { ScanedImageEditor } from "./components/ScanedImageEditor"

export interface Props extends NoteComponentProps {
  noteData: ImageNoteData
}

export const ImageNote = ((props: Props) => {
  const [isActive, setIsActive] = createSignal(false)
  const [isShowCloseDialog, setIsShowCloseDialog] = createSignal(false)

  props.on('focus', (evt) => {
    setIsActive(evt.isActive)
  })

  const [imageBlob, setImageBlob] = createSignal<Blob | undefined>()

  const [isShowEditor, setIsShowEditor] = createSignal(false)
  return <div onClick={() => props.focus()}>
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
      <ScanedImageEditor onEnd={() => {
        setIsShowEditor(false)
      }} />
    </Show>
    <Show when={!noteBookState.isEditMode}>
      <div>
        Player
      </div>
    </Show>
    <Show when={noteBookState.isEditMode}>
      <div class="p-2 rounded border my-2 bg-white">
        { !imageBlob() && <div class="text-center">
          <div class="text-xl">ImageNote</div>
          <div>まだスキャンされていません</div>
          <div class="my-2 flex justify-center">
            <button class="outlined-button" onClick={() => {
              setIsShowEditor(true)
            }}>スキャン</button>
          </div>
        </div>}
      </div>
      <Show when={isActive()}>
        <div class="flex justify-center gap-5">
          <Controller
            noteIndex={props.index}
            notesLength={props.notes.length}

            onRemove={() => setIsShowCloseDialog(true)}
            onUpNote={() => props.up()}
            onDownNote={() => props.down()}/>
        </div>
      </Show>
    </Show>
  </div>
}) satisfies NoteComponent
