import { type SetStoreFunction, createStore } from "solid-js/store"
import type { Note, NoteData, NotesData } from "../../Notes"

import { createTiptapEditor } from 'solid-tiptap'
import StarterKit from '@tiptap/starter-kit'

export interface TextNoteData extends NoteData {
  canToJsonData: {
    html: string
  }
}

export const addTextNote = (notesData: NotesData, defaultText?: string) => {
  const [noteData, setNoteData] = createStore<TextNoteData>({
    blobs: {},
    canToJsonData: {
      html: defaultText || 'NanohaNote!!!'
    }
  })
  const addNote: Note = {
    noteData,
    setNoteData,
    element: <TextNote noteData={noteData} setNoteData={setNoteData} />
  }
  notesData.setNotes([
    ...notesData.notes(),
    addNote
  ])
}

export interface Props {
  noteData: TextNoteData
  setNoteData: SetStoreFunction<TextNoteData>
}
const TextNote = (props: Props) => {
  let ref!: HTMLDivElement;

  const editor = createTiptapEditor(() => ({
    element: ref!,
    extensions: [
      StarterKit,
    ],
    content: props.noteData.canToJsonData.html,
  }))
  return <div>
    <div id="editor" ref={ref} />
  </div>
}
export default TextNote