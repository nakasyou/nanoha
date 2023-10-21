import type { Note, NoteData, NoteComponent } from "../../Notes"

export interface TextNoteCanToJsonData {
  html: string
}
export type TextNoteData = NoteData<TextNoteCanToJsonData>
