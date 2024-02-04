import type { NoteComponent, NoteComponentProps } from '../../notes-utils'
import StarterKit from '@tiptap/starter-kit'
import type { TextNoteData } from './types'
import { ExtensionSheet } from './tiptap/PluginSheet'
import {
  Match,
  Show,
  Switch,
  createEffect,
  createSignal,
  onMount
} from 'solid-js'
import { removeIconSize } from '../../../utils/icon/removeIconSize'
import IconNote from '@tabler/icons/note.svg?raw'
import IconNoteOff from '@tabler/icons/note-off.svg?raw'

import { Editor } from '@tiptap/core'
import { Dialog } from '../../utils/Dialog'
import { Controller } from '../../note-components/Controller'
import { noteBookState } from '../../../store'
import { Player } from './Player'

import './TextNoteStyle.css'
import type { SetStoreFunction } from 'solid-js/store'

export interface Props extends NoteComponentProps {
  noteData: TextNoteData
  setNoteData: SetStoreFunction<TextNoteData>
}

export const TextNote = ((props: Props) => {
  let editorRef!: HTMLDivElement

  const [getEditor, setEditor] = createSignal<Editor>()

  const [getIsFocused, setIsFocused] = createSignal(false)
  const [getIsActiveSheet, setIsActiveSheet] = createSignal(false)

  onMount(() => {
    const editor = new Editor({
      element: editorRef,
      extensions: [
        StarterKit,
        ExtensionSheet({
          sheetClassName: ''
        })
      ],
      content: props.noteData.canToJsonData.html
    })
    setEditor(editor)

    editor.on('focus', (evt) => {
      setIsFocused(evt.editor.isFocused)
    })
    editor.on('transaction', () => {
      setIsActiveSheet(editor.isActive('sheet'))
    })
  })

  const [isActive, setIsActive] = createSignal(false)

  props.on('focus', (evt) => {
    setIsActive(evt.isActive)
  })

  createEffect(() => {
    const isFocused = getIsFocused() || false
    if (isFocused) {
      // このノートがFocusしたことを他のノートに伝える
      props.focus()
    }
  })

  const [isShowCloseDialog, setIsShowCloseDialog] = createSignal(false)
  const saveContext = () => {
    props.setNoteData('canToJsonData', 'html', getEditor()?.getHTML() || '')
  }
  return (
    <div>
      <Show when={!noteBookState.isEditMode}>
        <div>
          <Player html={getEditor()?.getHTML() || ''} />
        </div>
      </Show>
      <div
        classList={{
          hidden: !noteBookState.isEditMode
        }}
      >
        {isShowCloseDialog() && (
          <Dialog
            onClose={(result) => {
              if (result) {
                // 消していいいらしい
                props.removeNote()
              }
              setIsShowCloseDialog(false)
            }}
            type="confirm"
            title="削除しますか?"
          >
            ノートを削除すると、元に戻せなくなる可能性があります。
          </Dialog>
        )}
        <div>
          <div
            id="editor"
            ref={editorRef}
            onFocusOut={saveContext}
            class="textnote-tiptap-container bg-on-tertiary rounded my-2 border boader-outlined nanohanote-textnote-styler"
          />
        </div>
        <Show when={isActive()}>
          <div class="flex justify-center gap-5">
            <div class="flex justify-center">
              <div
                class="grid hover:drop-shadow drop-shadow-none rounded-full p-1 bg-white border"
                onClick={() => {
                  getEditor()?.chain().focus().toggleSheet().run()
                }}
              >
                <Switch
                  fallback={
                    <div
                      innerHTML={removeIconSize(IconNoteOff)}
                      class="w-8 h-8"
                    />
                  }
                >
                  <Match when={getIsActiveSheet()}>
                    <div innerHTML={removeIconSize(IconNote)} class="w-8 h-8" />
                  </Match>
                </Switch>
              </div>
            </div>
            <Controller
              noteIndex={props.index}
              notesLength={props.notes.length}
              onRemove={() => setIsShowCloseDialog(true)}
              onUpNote={() => props.up()}
              onDownNote={() => props.down()}
            />
          </div>
        </Show>
      </div>
    </div>
  )
}) satisfies NoteComponent
