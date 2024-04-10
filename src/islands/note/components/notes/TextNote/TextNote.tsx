import type { NoteComponent, NoteComponentProps } from '../../notes-utils'
import StarterKit from '@tiptap/starter-kit'
import type { TextNoteData } from './types'
import { ExtensionSheet } from './tiptap/PluginSheet'
import { Underline } from '@tiptap/extension-underline'
import {
  For,
  Match,
  Show,
  Switch,
  createEffect,
  createSignal,
  onMount
} from 'solid-js'
import { removeIconSize } from '../../../utils/icon/removeIconSize'

import IconNote from '@tabler/icons/outline/note.svg?raw'
import IconBold from '@tabler/icons/outline/bold.svg?raw'
import IconUnderline from '@tabler/icons/outline/underline.svg?raw'

import { Editor, isActive } from '@tiptap/core'
import { Dialog } from '../../utils/Dialog'
import { Controller } from '../../note-components/Controller'
import { noteBookState } from '../../../store'
import { Player } from './Player'

import './TextNoteStyle.css'
import type { SetStoreFunction } from 'solid-js/store'
import { getVisualViewport } from '../../../window-apis'

export interface Props extends NoteComponentProps {
  noteData: TextNoteData
  setNoteData: SetStoreFunction<TextNoteData>
}

export const TextNote = ((props: Props) => {
  let editorRef!: HTMLDivElement

  const [getEditor, setEditor] = createSignal<Editor>()

  const [getIsActiveSheet, setIsActiveSheet] = createSignal(false)
  const [getIsActiveBold, setIsActiveBold] = createSignal(false)
  const [getIsActiveUndlerline, setIsActiveUndlerline] = createSignal(false)
  const [getIsActive, setIsActive] = createSignal(false)
  const [isShowCloseDialog, setIsShowCloseDialog] = createSignal(false)

  const controllerItems = [
    {
      icon: IconNote,
      toggle: 'toggleSheet',
      isActive: getIsActiveSheet
    },
    {
      icon: IconBold,
      toggle: 'toggleBold',
      isActive: getIsActiveBold
    },
    {
      icon: IconUnderline,
      toggle: 'toggleUnderline',
      isActive: getIsActiveUndlerline
    }
  ] satisfies {
    icon: string
    toggle: keyof Editor['commands'] & `toggle${string}`
    isActive: () => boolean
  }[]

  const startEditor = () => {
    if (!editorRef) {
      return
    }
    const editor = new Editor({
      element: editorRef,
      extensions: [
        StarterKit,
        ExtensionSheet({
          sheetClassName: ''
        }),
        Underline
      ],
      content: props.noteData.canToJsonData.html
    })
    setEditor(editor)

    editor.on('transaction', () => {
      setIsActiveSheet(editor.isActive('sheet'))
      setIsActiveBold(editor.isActive('bold'))
      setIsActiveUndlerline(editor.isActive('underline'))
    })
  }

  onMount(() => {
    editorRef.onfocus = () => {
      props.focus()
    }
  })
  const saveContent = () => {
    props.setNoteData('canToJsonData', 'html', getEditor()?.getHTML() || '')
    props.updated()
  }

  props.on('focus', (evt) => {
    setIsActive(evt.isActive)
  })

  createEffect(() => {
    const isActive = getIsActive()
    const editor = getEditor()
    if (isActive) {
      if (editor?.isDestroyed || !editor) {
        startEditor()
      }
    } else {
      editor?.destroy()
    }
  })
  return (
    <div class="my-2">
      <Show when={isShowCloseDialog()}>
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
      </Show>

      <Show when={!noteBookState.isEditMode}>
        <Player html={getEditor()?.getHTML() || ''} />
      </Show>

      <div
        classList={{
          hidden: !getIsActive() || !noteBookState.isEditMode
        }}
      >
        <div class="textnote-tiptap-container rounded my-2 border boader-outlined nanohanote-textnote-styler">
          <div
            id="editor"
            ref={editorRef}
            onFocusOut={saveContent}
            onInput={saveContent}
          />
        </div>
      </div>
      <div
        classList={{
          hidden: getIsActive() || !noteBookState.isEditMode
        }}
      >
        <div
          innerHTML={props.noteData.canToJsonData.html}
          class="rounded p-2 border boader-outlined"
          onClick={() => {
            props.focus()
          }}
        />
      </div>

      <Show when={getIsActive()}>
        <div class="flex flex-col justify-center gap-2">
          <div
            class="flex justify-center gap-2 fixed left-0 w-full"
            style={{
              top:
                (getVisualViewport()?.data?.height ?? 0) +
                (getVisualViewport()?.data?.pageTop ?? 0) -
                32 + 'px'
            }}
          >
            <For each={controllerItems}>
              {(data) => (
                <button
                  class="grid drop-shadow-none"
                  onClick={() => {
                    getEditor()?.chain().focus()[data.toggle]().run()
                  }}
                  classList={{
                    'bg-secondary-container text-secondary rounded':
                      data.isActive()
                  }}
                >
                  <div innerHTML={removeIconSize(data.icon)} class="w-8 h-8" />
                </button>
              )}
            </For>
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
  )
}) satisfies NoteComponent
