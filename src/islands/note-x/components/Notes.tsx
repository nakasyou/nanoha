import { createSignal, type Accessor, type Setter, type JSX } from 'solid-js'
import { Key } from '@solid-primitives/keyed'
import { type SetStoreFunction, createStore } from "solid-js/store"
import { moveArray } from '../utils/array/moveArray'

export interface NoteData <CanToJsonData extends any = any> {
  /**
   * ノートのファイルストア
   */
  blobs: Record<string, Blob>
  /**
   * `JSON.parse`ができるデータ
   */
  canToJsonData: CanToJsonData
}
export interface NoteComponentProps <CanToJsonData extends any = any> {
  noteData: NoteData<CanToJsonData>

  focus (): void
  on <EventType extends keyof NoteEvents>(type: EventType, listenter: (evt: NoteEventArgs[EventType]) => void): void
  removeNote (): void

  up (): void
  down (): void

  index: number
  notes: Note[]
}
export type NoteComponent<CanToJsonData extends any = any> = (props: NoteComponentProps<CanToJsonData>) => JSX.Element

export interface NoteEvents {
  focus?: ((evt: NoteEventArgs['focus']) => void)[]
}
export interface NoteEventArgs {
  focus: {
    isActive: boolean
  }
}
export interface Note <CanToJsonData = any> {
  id: string
  Component: NoteComponent<CanToJsonData>
  noteData: NoteData

  events: NoteEvents
}
export const createNotes = (): {
  notes: Accessor<Note[]>
  setNotes: Setter<Note[]>
} => {
  const [notes, setNotes] = createSignal<Note[]>([])
  return {
    notes,
    setNotes
  }
}

export default (props: {
  notes: Note[],
  setNotes: Setter<Note[]>
}) => {
  return <Key each={props.notes} by={note => note.id}>
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
  </Key>
}
