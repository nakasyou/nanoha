import { createStore } from 'solid-js/store'
import type { ImageNoteData } from './types'
import type { Note } from '../../notes-utils'
import { ImageNote } from './ImageNote'

export const createImageNote = (initNoteData?: ImageNoteData) => {
  /*const [noteData, setNoteData] = createStore<TextNoteData>({
    blobs: {},
    canToJsonData: {
      html: defaultText || 'NanohaNote!!!'
    }
  })*/
  const [noteData, setNoteData] = createStore<ImageNoteData>(
    initNoteData ?? {
      blobs: {},
      canToJsonData: {
        sheets: [],
      },
      type: 'image',
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    },
  )
  const addNote: Note<ImageNoteData> = {
    Component: ImageNote,
    noteData,
    setNoteData,
    events: {},
  }
  return addNote
}
