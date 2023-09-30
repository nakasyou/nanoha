import { createStore } from 'solid-js/store'
import Notes, { createNotes } from './components/Notes'
import { addTextNote } from './components/notes/TextNote'
import Header from './components/Header'
export interface Props {

}
export const [noteStateStore, setNoteStoreStore] = createStore({
  isEditMode: false
})
export default () => {
  const notes = createNotes()
  addTextNote(notes)
  return <div>
    <Header />
    <div class="mx-5">
      <Notes notes={notes} />
    </div>
  </div>
}
