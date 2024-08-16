import type { TextNoteCanToJsonData, TextNoteData } from './types'
import type { Note, NoteData } from '../../notes-utils'
import { TextNote } from './TextNote'
import { createStore } from 'solid-js/store'

export const createTextNote = (initNoteData?: TextNoteData) => {
  /*const [noteData, setNoteData] = createStore<TextNoteData>({
    blobs: {},
    canToJsonData: {
      html: defaultText || 'NanohaNote!!!'
    }
  })*/
  const [noteData, setNoteData] = createStore<TextNoteData>(
    initNoteData ?? {
      blobs: {},
      canToJsonData: {
        html: 'NanohaNote!!!',
      },
      type: 'text',
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    },
  )
  const addNote: Note<TextNoteData> = {
    Component: TextNote,
    noteData,
    setNoteData,
    events: {}
  }
  return addNote
}
