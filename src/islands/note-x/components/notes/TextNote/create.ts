import { createStore } from "solid-js/store"
import type { TextNoteData, TextNoteCanToJsonData } from "./types"
import type { Note } from '../../Notes'
import { TextNote } from "./TextNote"

export const createTextNote = (defaultText?: string) => {
  const [noteData, setNoteData] = createStore<TextNoteData>({
    blobs: {},
    canToJsonData: {
      html: defaultText || 'NanohaNote!!!'
    }
  })
  const addNote: Note<TextNoteCanToJsonData> = {
    Component: TextNote,
    id: crypto.randomUUID(),
    noteData,
    setNoteData,
  }
  return addNote
}
