import { notes } from '../store'
import { load } from '../utils/file-format'
import type { Note } from './notes-utils'
import { createImageNote } from './notes/ImageNote'
import { createTextNote } from './notes/TextNote'

export const loadFromBlob = async (targetFile: Blob) => {
  const loadResult = await load(targetFile)

  if (!loadResult.success) {
    return loadResult.error
  }
  const newNotes: Note[] = loadResult.notes.map((note) => {
    let newNote: Note
    switch (note.type) {
      case 'image':
        newNote = createImageNote(note) as Note
        break
      case 'text':
        newNote = createTextNote(note) as Note
        break
    }
    return newNote
  })
  notes.setNotes(newNotes)
}
