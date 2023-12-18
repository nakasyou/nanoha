import type { TextNoteCanToJsonData } from "./types"
import type { Note } from '../../notes-utils'
import { TextNote } from "./TextNote"

export const createTextNote = (defaultText?: string) => {
  /*const [noteData, setNoteData] = createStore<TextNoteData>({
    blobs: {},
    canToJsonData: {
      html: defaultText || 'NanohaNote!!!'
    }
  })*/
  const noteData = {
    blobs: {},
    canToJsonData: {
      html: defaultText || 'NanohaNote!!!'
    }
  }
  const addNote: Note<TextNoteCanToJsonData> = {
    Component: TextNote,
    id: crypto.randomUUID(),
    noteData,
    events: {},
  }
  return addNote
}
