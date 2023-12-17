import { createStore } from "solid-js/store"

export interface NoteBookState {
  isEditMode: boolean
}
export const [noteBookState, setNoteBookState] = createStore<NoteBookState>({
  isEditMode: true,
})
