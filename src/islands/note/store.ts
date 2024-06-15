import { createStore } from "solid-js/store"
import { createNotes } from "./components/notes-utils"

export interface NoteBookState {
  isEditMode: boolean
  isMenuActive: boolean
  isSaved: boolean
  sheetDefaultState: boolean
}
export const [noteBookState, setNoteBookState] = createStore<NoteBookState>({
  isEditMode: true,
  isMenuActive: false,
  isSaved: true,
  sheetDefaultState: false
})

export interface NoteBookMetadata {
  noteName: string
}
export const [noteBookMetadata, setNoteBookMetadata] = createStore<NoteBookMetadata>({
  noteName: ''
})

export const notes = createNotes()

