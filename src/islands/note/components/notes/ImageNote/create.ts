import { createStore } from 'solid-js/store'
import type { Note } from '../../notes-utils'
import { ImageNote } from './ImageNote'
import type { ImageNoteData } from './types'

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
  }
  return addNote
}
