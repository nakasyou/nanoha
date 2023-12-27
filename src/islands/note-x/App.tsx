import Notes from './components/Notes'
import  { createTextNote } from './components/notes/TextNote'
import Header from './components/Header'
import Fab from './components/Fab'
import { createEffect, createSignal, onMount } from 'solid-js'

import './App.css'
import { createImageNote } from './components/notes/ImageNote'
import { Menu } from './components/Menu'
import { notes } from './store'

export interface Props {

}

export default () => {
  onMount(() => {
    notes.setNotes([
      createTextNote(`これはNanohaNoteです!`),
      ...notes.notes()
    ])
  })
  return <div class="bg-background h-screen touch-manipulation">
    <div class="flex flex-col lg:flex-row lg:max-w-[calc(100dvw-2.5em)]">
      <div class="sticky lg:fixed top-0 z-30">
        <Header />
      </div>
      <div class="w-10 hidden lg:block flex-shrink-0">

      </div>
      <div class="px-2 w-full pb-5">
        {
          notes.notes().length === 0 ?
            <div class="text-center my-2">
              <div>
                <p class="text-xl">ここにはノートが一つもありません :(</p>
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
    <Menu />
  </div>
}
