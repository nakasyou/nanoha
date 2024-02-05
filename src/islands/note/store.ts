import { createStore } from "solid-js/store"
import { createNotes } from "./components/notes-utils"

export interface NoteBookState {
  isEditMode: boolean
  isMenuActive: boolean,
  isSaved: boolean
}
export const [noteBookState, setNoteBookState] = createStore<NoteBookState>({
  isEditMode: true,
  isMenuActive: false,
  isSaved: true
})

export const notes = createNotes()

