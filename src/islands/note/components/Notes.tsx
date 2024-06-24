import {
  createSignal,
  type Accessor,
  type Setter,
  type JSX,
  createEffect,
  Show,
} from 'solid-js'
import { Key } from '@solid-primitives/keyed'
import { moveArray } from '../utils/array/moveArray'

import type { Note } from './notes-utils'
import { notes, setNoteBookState } from '../store'
import { Controller } from './note-components/Controller'
import { Dialog } from './utils/Dialog'

export default (props: {
  notes: Note[]
  setNotes: Setter<Note[]>
}) => {
  const [getFocusedIndex, setFocusedIndex] = createSignal(0)
  const [getIndexToRemove, setIndexToRemove] = createSignal<null | number>(null)

  const handleUpdate = () => {
    setNoteBookState('isSaved', false)
  }
  createEffect(() => {
    notes.notes
    handleUpdate()
  })
  return (
    <div class="flex flex-col gap-2 my-2">
      <Show when={getIndexToRemove() !== null}>
        <Dialog
          type="confirm"
          onClose={(result) => {
            const indexToRemove = getIndexToRemove()
            setIndexToRemove(null)
            if (!result) {
              return
            }
            if (indexToRemove === null) {
              return
            }
            const newNotes = [...props.notes]
            newNotes.splice(indexToRemove, 1)
            props.setNotes(newNotes)
            setIndexToRemove(null)
          }}
          title="ノートを削除しますか？"
        >
          削除すると、もとに戻せない可能性があります。
        </Dialog>
      </Show>
      <Key each={props.notes} by={(note) => note.noteData.id}>
        {(note, index) => {
          const nowNote = note()
          const NoteComponent = nowNote.Component
          createEffect(() => {
            nowNote.noteData
            handleUpdate()
          })
          return (
            <div>
              <div class="border p-1">
                <NoteComponent
                  noteData={note().noteData}
                  setNoteData={note().setNoteData}
                  focus={() => {
                    for (const eachNote of props.notes) {
                      const isActive =
                        eachNote.noteData.id === note().noteData.id
                      for (const focusEventListener of eachNote.events.focus ||
                        []) {
                        focusEventListener({
                          isActive,
                        })
                      }
                      if (isActive) {
                        setFocusedIndex(index)
                      }
                    }
                  }}
                  updated={handleUpdate}
                  on={(type, listener) => {
                    const thisNote = props.notes[index()]
                    if (!thisNote) return
                    if (!thisNote.events[type]) {
                      thisNote.events[type] = []
                    }
                    thisNote.events[type]?.push(listener)
                  }}
                  index={index()}
                  notes={props.notes}
                />
              </div>
              <Show when={getFocusedIndex() === index()}>
                <Controller
                  onRemove={() => {
                    setIndexToRemove(index())
                  }}
                  onDownNote={() => {
                    setFocusedIndex(index() + 1)
                    props.setNotes(moveArray(props.notes, index(), index() + 1))
                  }}
                  onUpNote={() => {
                    setFocusedIndex(index() - 1)
                    props.setNotes(moveArray(props.notes, index(), index() - 1))
                  }}
                  noteIndex={index()}
                  notesLength={props.notes.length}
                />
              </Show>
            </div>
          )
        }}
      </Key>
    </div>
  )
}
