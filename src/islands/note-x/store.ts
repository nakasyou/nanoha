import { createStore } from "solid-js/store"
import { createNotes } from "./components/notes-utils"

export interface NoteBookState {
  isEditMode: boolean
  isMenuActive: boolean
}
export const [noteBookState, setNoteBookState] = createStore<NoteBookState>({
  isEditMode: true,
  isMenuActive: false
})

export const notes = createNotes()

