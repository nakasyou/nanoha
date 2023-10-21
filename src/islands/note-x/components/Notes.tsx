import { createSignal, type Accessor, type Setter, type JSX } from 'solid-js'
import { Key } from '@solid-primitives/keyed'
import { type SetStoreFunction, createStore } from "solid-js/store"

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
export type NoteComponent<CanToJsonData extends any = any> = (props: {
  noteData: NoteData<CanToJsonData>
  setNoteData: SetStoreFunction<NoteData<CanToJsonData>>
}) => JSX.Element

export interface Note <CanToJsonData = any> {
  id: string
  Component: NoteComponent<CanToJsonData>
  noteData: NoteData
  setNoteData: SetStoreFunction<NoteData<CanToJsonData>>
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
  notes: Note[]
}) => {
  return <Key each={props.notes} by={note => note.id}>
    {(note) => {
      const NoteComponent = note().Component
      return <div>
        <NoteComponent noteData={note().noteData} setNoteData={note().setNoteData}/>
      </div>
    }}
  </Key>
}
