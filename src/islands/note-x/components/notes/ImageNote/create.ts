import { createStore } from "solid-js/store"
import type { ImageNoteData, ImageNoteCanToJsonData } from "./types"
import type { Note, NoteData } from '../../notes-utils'
import { ImageNote } from "./ImageNote"

export const createImageNote = () => {
  /*const [noteData, setNoteData] = createStore<TextNoteData>({
    blobs: {},
    canToJsonData: {
      html: defaultText || 'NanohaNote!!!'
    }
  })*/
  const [noteData, setNoteData] = createStore<NoteData<ImageNoteCanToJsonData>>({
    blobs: {},
    canToJsonData: {
      sheets: []
    },
    type: 'image'
  })
  const addNote: Note<ImageNoteCanToJsonData> = {
    Component: ImageNote,
    id: crypto.randomUUID(),
    noteData,
    setNoteData,
    events: {},
  }
  return addNote
}
