import { createSignal, type Accessor, type Setter, type JSX } from 'solid-js'
import { Key } from '@solid-primitives/keyed'
import { moveArray } from '../utils/array/moveArray'

import type { Note } from './notes-utils'

export default (props: {
  notes: Note[],
  setNotes: Setter<Note[]>
}) => {
  return <div class="flex flex-col gap-1"><Key each={props.notes} by={note => note.id}>
    {(note, index) => {
      const NoteComponent = note().Component
      return <div>
        <NoteComponent
          noteData={note().noteData}

          focus={() => {
            for (const eachNote of props.notes) {
              for (const focusEventListener of (eachNote.events.focus || [])) {
                focusEventListener({
                  isActive: eachNote.id === note().id
                })
              }
            }
          }}

          on={(type, listener) => {
            const thisNote = props.notes[index()]
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
