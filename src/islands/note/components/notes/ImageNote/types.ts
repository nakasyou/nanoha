import type { NoteData, NoteComponent } from "../../notes-utils"
import type { Sheets } from "./components/Sheet"

export interface ImageNoteCanToJsonData {
  sheets: Sheets
}

export type ImageNoteData = NoteData<ImageNoteCanToJsonData, 'scanedImage'>
