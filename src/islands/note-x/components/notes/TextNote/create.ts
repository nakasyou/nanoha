import type { TextNoteCanToJsonData } from "./types"
import type { Note, NoteData } from '../../notes-utils'
import { TextNote } from "./TextNote"
import { createStore } from "solid-js/store"

export const createTextNote = (defaultText?: string) => {
  /*const [noteData, setNoteData] = createStore<TextNoteData>({
    blobs: {},
    canToJsonData: {
      html: defaultText || 'NanohaNote!!!'
    }
  })*/
  const [noteData, setNoteData] = createStore<NoteData>({
    blobs: {},
    canToJsonData: {
      html: defaultText || 'NanohaNote!!!'
    },
    type: 'text'
  })
  const addNote: Note<TextNoteCanToJsonData> = {
    Component: TextNote,
    id: crypto.randomUUID(),
    noteData,
    setNoteData,
    events: {},
  }
  return addNote
}
