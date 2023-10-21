import { createStore } from 'solid-js/store'
import Notes, { createNotes } from './components/Notes'
import  { createTextNote } from './components/notes/TextNote'
import Header from './components/Header'
import Fab from './components/Fab'
import { createEffect } from 'solid-js'

export interface Props {

}
export const [noteStateStore, setNoteStoreStore] = createStore({
  isEditMode: false
})
export default () => {
  const notes = createNotes()
  createTextNote()

  notes.setNotes([
    ...notes.notes()
  ])

  return <div class="bg-background h-screen">
    <Header />
    <div class="mx-5">
      <Notes notes={notes.notes()} />
    </div>
    <Fab onAddTextNote={() => {
      notes.setNotes([
        ...notes.notes(),
        createTextNote()
      ])
    }}/>
  </div>
}
