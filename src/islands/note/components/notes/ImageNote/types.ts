import type { NoteData, NoteComponent } from '../../notes-utils'
import type { Sheets } from './components/Sheet'

export interface ImageNoteCanToJsonData {
  sheets: Sheets
}

export interface ImageNoteData extends NoteData {
  type: 'image'
  blobs: {
    scanedImage?: Blob
  }
  canToJsonData: ImageNoteCanToJsonData
}
