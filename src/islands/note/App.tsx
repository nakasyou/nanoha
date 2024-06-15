import Notes from './components/Notes'
import  { createTextNote } from './components/notes/TextNote'
import Header from './components/Header'
import Fab from './components/Fab'
import { Show, createSignal, onMount, onCleanup, createEffect } from 'solid-js'

import './App.css'
import { createImageNote } from './components/notes/ImageNote'
import { Menu } from './components/Menu'
import { noteBookState, notes, setNoteBookState, setNoteBookMetadata, noteBookMetadata } from './store'
import type { Props } from '.'
import { Dialog } from './components/utils/Dialog'
import { NotesDB } from '../shared/storage'
import { loadFromBlob } from './components/load-process'
import { save as saveFromNotes } from './utils/file-format'

import iconSvg from '../../assets/icon-new.svg?raw'

export default (props: Props) => {
  let timeoutEnded = false

  const [getMounted, setMounted] = createSignal(false)

  setNoteBookState('loadType', props.noteLoadType)
  onCleanup(() => {
    timeoutEnded = true
  })
  onMount(async () => {
    setMounted(true)
    notes.setNotes([
      createTextNote({
        blobs: {},
        canToJsonData: {
          html: '<h1>Loading...</h1>'
        },
        type: 'text',
        id: crypto.randomUUID(),
      }),
      ...notes.notes()
    ])

    let save: () => Promise<void> = async () => void 0
    if (props.noteLoadType.from === 'unknown') {
      setLoadError('指定したノートは存在しません。URLが正しいことを確認してください。')
      return
    } else if (props.noteLoadType.from === 'local') {
      const db = new NotesDB()
      const noteResponse = await db.notes.get(props.noteLoadType.id)
      if (!noteResponse) {
        setLoadError(`ノートID${props.noteLoadType.id}はローカルに存在しませんでした。`)
        return
      }
      setNoteBookMetadata('noteName', noteResponse.name)
      await loadFromBlob(new Blob([noteResponse.nnote]))
      save = async () => {
        const data = await saveFromNotes(notes.notes())
        db.notes.update(noteResponse, {
          nnote: new Uint8Array(await data.arrayBuffer()),
          updated: new Date(),
          name: noteBookMetadata.noteName
        })
      }
    }

    const saveStep = async () => {
      if (!noteBookState.isSaved) {
        await save()
      }
      setNoteBookState('isSaved', true)
      if (!timeoutEnded) {
        setTimeout(saveStep, 1000)
      }
    }
    saveStep()
  })
  const [getLoadError, setLoadError] = createSignal<string>()

  createEffect(() => {
    if (!noteBookState.isEditMode) {
      for (const note of notes.notes()) {
        for (const handler of (note.events?.focus ?? [])) {
          handler({
            isActive: false
          })
        }
      }
    }
  })
  onMount(() => {
    const url = new URL(location.href)
    if (url.searchParams.has('play')) {
      setNoteBookState('isEditMode', false)
    }
  })
  return <div class="bg-background h-[100dvh] touch-manipulation">
    <Show when={getLoadError()}>
      <Dialog onClose={() => setLoadError(void 0)} type="alert" title="Load Error">{ getLoadError() }</Dialog>
    </Show>
    <div class="flex flex-col h-[100dvh] lg:flex-row w-full">
      <div class="lg:h-[100dvh] lg:border-r border-b lg:border-b-0 border-r-0">
        <Header />
      </div>
      <div class="px-2 w-full pb-5 h-[100dvh] overflow-y-auto grow">
        <Show when={getMounted()} fallback={<div class="grid place-items-center w-full h-full grid-rows-2">
          <div class="text-3xl font-bold">Loading Nanoha...</div>
          <div innerHTML={iconSvg} class='w-32 h-32 flex justify-center items-center'></div>
        </div>}>
          {
            notes.notes().length === 0 ?
              <div class="text-center my-2">
                <div>
                  <p class="text-xl">ここにはノートが一つもありません :(</p>
                  <p>右下の<span class="text-2xl">+</span>を押して、ノートを追加しましょう!</p>
                </div>
              </div> : <Notes notes={notes.notes()} setNotes={notes.setNotes}/>
          }
        </Show>
      </div>
    </div>
    <Show when={getMounted()}>
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
    </Show>
    
    <Menu />
  </div>
}
