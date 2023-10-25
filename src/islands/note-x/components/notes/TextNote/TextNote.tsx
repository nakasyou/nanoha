import type { NoteComponent } from "../../Notes"
import { type SetStoreFunction } from "solid-js/store"
import { createEditorTransaction, createTiptapEditor } from 'solid-tiptap'
import StarterKit from '@tiptap/starter-kit'
import type { TextNoteData } from "./types"
import { ExtensionSheet } from "./tiptap/PluginSheet"
import { Show } from "solid-js"
import { removeIconSize } from "../../../utils/icon/removeIconSize"
import IconNote from '@tabler/icons/note.svg?raw'

export interface Props {
  noteData: TextNoteData
  setNoteData: SetStoreFunction<TextNoteData>
}

export const TextNote = ((props: Props) => {
  let ref!: HTMLDivElement;

  const editor = createTiptapEditor(() => ({
    element: ref!,
    extensions: [
      StarterKit,
      // @ts-expect-error
      ExtensionSheet({
        sheetClassName: 'bg-red-100'
      })
    ],
    content: props.noteData.canToJsonData.html,
  }))
  const isFocused = createEditorTransaction(
    editor, // Editor instance from createTiptapEditor
    (editor) => editor?.isFocused, 
  )
  return <div>
    <div>
      <div id="editor" ref={ref} class="bg-on-tertiary p-2 rounded my-2 border boader-outlined" />
    </div>
    <Show when={isFocused()}>
      <div class="flex justify-center">
        <div>
          <div innerHTML={removeIconSize(IconNote)} class="w-8 h-8" />
        </div>
      </div>
    </Show>
  </div>
}) satisfies NoteComponent
