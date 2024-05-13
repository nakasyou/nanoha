import { createSignal, type Accessor, type Setter, type JSX, createEffect } from 'solid-js'
import { Key } from '@solid-primitives/keyed'
import { moveArray } from '../utils/array/moveArray'

import type { Note } from './notes-utils'
import { notes, setNoteBookState } from '../store'

export default (props: {
  notes: Note[],
  setNotes: Setter<Note[]>
}) => {
  const handleUpdate = () => {
    setNoteBookState('isSaved', false)
  }
  createEffect(() => {
    notes.notes
    handleUpdate()
  })
  return <div class="flex flex-col gap-1"><Key each={props.notes} by={note => note.noteData.id}>
    {(note, index) => {
      const nowNote = note()
      const NoteComponent = nowNote.Component
      createEffect(() => {
        nowNote.noteData
        handleUpdate()
      })
      return <div>
        <NoteComponent
          noteData={note().noteData}
          setNoteData={note().setNoteData}
          focus={() => {
            for (const eachNote of props.notes) {
              for (const focusEventListener of (eachNote.events.focus || [])) {
                focusEventListener({
                  isActive: eachNote.noteData.id === note().noteData.id
                })
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

          removeNote={() => {
            const newNotes = [...props.notes]
            newNotes.splice(index(), 1)
            props.setNotes(newNotes)
          }}

          up={() => {
            props.setNotes(moveArray(props.notes, index(), index() - 1))
          }}
          down={() => {
            props.setNotes(moveArray(props.notes, index(), index() + 1))
          }}

          index={index()}
          notes={props.notes}
          />
      </div>
    }}
  </Key></div>
}
