import { createStore } from 'solid-js/store'
import Notes, { createNotes } from './components/Notes'
import  { createTextNote } from './components/notes/TextNote'
import Header from './components/Header'
import Fab from './components/Fab'
import { createEffect } from 'solid-js'
import './App.css'
import { createImageNote } from './components/notes/ImageNote'

export interface Props {

}

export const [noteBookState, setNoteBookState] = createStore<NoteBookState>({
  isEditMode: true
})

export interface NoteBookState {
  isEditMode: boolean
}
export default () => {
  const notes = createNotes()
  
  notes.setNotes([
    createTextNote(`これはNanohaNoteです!`),
    ...notes.notes()
  ])

  return <div class="bg-background h-screen touch-manipulation">
    <div class="flex flex-col lg:flex-row">
      <div class="sticky lg:fixed top-0">
        <Header />
      </div>
      <div class="w-10 hidden lg:block">

      </div>
      <div class="px-2 w-full pb-5">
        {
          notes.notes().length === 0 ?
            <div class="text-center">
              <div>
                <p>ここにはノートが一つもありません :(</p>
                <p>右下の<span class="text-2xl">+</span>を押して、ノートを追加しましょう!</p>
              </div>
            </div> : <Notes notes={notes.notes()} setNotes={notes.setNotes}/>
        }
      </div>
    </div>
    
    <Fab
      onAddTextNote={() => {
        notes.setNotes([
          ...notes.notes(),
          createTextNote()
        ])
      }}
      onAddImageNote={() => {
        notes.setNotes([
          ...notes.notes(),
          createImageNote()
        ])
      }}
    />
  </div>
}
