import Dexie from 'dexie'
import type { NoteLoadType } from '../note/note-load-types'

export interface Notes {
  id?: number
  name: string
  nnote: Uint8Array
  updated: Date
}

export class NotesDB extends Dexie {
  notes: Dexie.Table<Notes, number>
  constructor() {
    super('notes') // データベース名をsuperのコンストラクタに渡す

    this.version(1).stores({
      notes: '++id, name, nnote, updated'
    })

    this.notes = this.table('notes')
  }
}

/**
 * Retrieves a note from the database based on the provided load type.
 *
 * @param loadType - The load type specifying the source of the note.
 * @return A promise that resolves to the retrieved note, or null if no note is found.
 */
export const loadNoteFromType = async (loadType: NoteLoadType): Promise<Notes | null> => {
  if (loadType.from === 'local') {
    const db = new NotesDB()
    return await db.notes.get(loadType.id) ?? null
  }
  return null
}
