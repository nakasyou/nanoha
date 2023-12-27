import { createStore } from "solid-js/store"
import type { ImageNoteData, ImageNoteCanToJsonData } from "./types"
import type { Note } from '../../notes-utils'
import { ImageNote } from "./ImageNote"

export const createImageNote = () => {
  /*const [noteData, setNoteData] = createStore<TextNoteData>({
    blobs: {},
    canToJsonData: {
      html: defaultText || 'NanohaNote!!!'
    }
  })*/
  const noteData: Note<ImageNoteCanToJsonData>['noteData'] = {
    blobs: {},
    canToJsonData: {
    }
  }
  const addNote: Note<ImageNoteCanToJsonData> = {
    Component: ImageNote,
    id: crypto.randomUUID(),
    noteData,
    events: {},
  }
  return addNote
}
