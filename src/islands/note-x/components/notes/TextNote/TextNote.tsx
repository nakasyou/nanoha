import type { NoteComponent } from "../../Notes"
import { type SetStoreFunction } from "solid-js/store"
import { createEditorTransaction, createTiptapEditor } from 'solid-tiptap'
import StarterKit from '@tiptap/starter-kit'
import type { TextNoteData } from "./types"
import { ExtensionSheet } from "./tiptap/PluginSheet"
import type { AnyExtension, Editor } from "@tiptap/core"
import { createEffect } from "solid-js"

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
  const isBold = createEditorTransaction(
    editor, // Editor instance from createTiptapEditor
    (editor) => editor?.isActive('bold'), 
  )
  createEffect(() => {
    console.log(isBold())
  })
  return <div>
    <div>
      <div id="editor" ref={ref} class="bg-on-tertiary p-2 rounded my-2 border boader-outlined" />
    </div>
    <div>
      
    </div>
  </div>
}) satisfies NoteComponent
