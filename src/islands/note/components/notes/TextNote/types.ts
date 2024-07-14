import type { NoteData } from '../../notes-utils'

export interface TextNoteCanToJsonData {
  html: string
}
export type TextNoteData = NoteData<TextNoteCanToJsonData>
