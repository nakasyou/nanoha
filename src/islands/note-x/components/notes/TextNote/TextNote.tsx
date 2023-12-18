import type { NoteComponent, NoteComponentProps } from "../../notes-utils"
import { createEditorTransaction, createTiptapEditor } from "solid-tiptap"
import StarterKit from "@tiptap/starter-kit"
import type { TextNoteData } from "./types"
import { ExtensionSheet } from "./tiptap/PluginSheet"
import { Match, Show, Switch, createEffect, createSignal } from "solid-js"
import { removeIconSize } from "../../../utils/icon/removeIconSize"
import IconNote from "@tabler/icons/note.svg?raw"
import IconNoteOff from "@tabler/icons/note-off.svg?raw"

import type { Editor } from "@tiptap/core"
import { Dialog } from "../../utils/Dialog"
import { Controller } from "../../note-components/Controller"
import { noteBookState, setNoteBookState } from "../../../store"
import { Player } from "./Player"

import "./TextNoteStyle.css"

export interface Props extends NoteComponentProps {
  noteData: TextNoteData
}

export const TextNote = ((props: Props) => {
  let ref!: HTMLDivElement

  const editor = createTiptapEditor(() => ({
    element: ref!,
    extensions: [
      StarterKit,
      // @ts-expect-error
      ExtensionSheet({
        sheetClassName: "",
      }),
    ],
    content: props.noteData.canToJsonData.html,
  })) as () => Editor | undefined

  const isFocused = createEditorTransaction(
    editor as ReturnType<typeof createTiptapEditor>, // Editor instance from createTiptapEditor
    (editor) => editor?.isFocused
  )

  const isActiveEachMethods = {
    sheet: createEditorTransaction(
      editor as ReturnType<typeof createTiptapEditor>,
      (editor) => editor?.isActive("sheet")
    ),
  }
  const [isActive, setIsActive] = createSignal(false)

  props.on("focus", (evt) => {
    setIsActive(evt.isActive)
  })

  createEffect(() => {
    const isFocusedResult = isFocused() || false
    if (isFocusedResult) {
      // このノートがFocusしたことを他のノートに伝える
      props.focus()
    }
  })

  const [isShowCloseDialog, setIsShowCloseDialog] = createSignal(false)
  const editorInputHandler = () => {
    props.noteData.canToJsonData.html = editor()?.getHTML() || ""
  }
  return (
    <div>
      <Show when={!noteBookState.isEditMode}>
        <div>
          <Player html={editor()?.getHTML() || ""} />
        </div>
      </Show>
      <div
        classList={{
          hidden: !noteBookState.isEditMode,
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
            onInput={editorInputHandler}
            id="editor"
            ref={ref}
            class="textnote-tiptap-container bg-on-tertiary rounded my-2 border boader-outlined nanohanote-textnote-styler"
          />
        </div>
        <Show when={isActive()}>
          <div class="flex justify-center gap-5">
            <div class="flex justify-center">
              <div
                class="grid hover:drop-shadow drop-shadow-none rounded-full p-1 bg-white border"
                onClick={() => {
                  editor()?.chain().focus().toggleSheet().run()
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
                  <Match when={isActiveEachMethods.sheet()}>
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
