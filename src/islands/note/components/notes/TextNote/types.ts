import type { NoteData } from '../../notes-utils'

export interface TextNoteCanToJsonData {
  html: string
}
export interface TextNoteData extends NoteData {
  type: 'text'
  canToJsonData: TextNoteCanToJsonData
}
