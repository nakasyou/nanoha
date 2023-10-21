import { createSignal } from "solid-js"
import type { Accessor, Setter, JSX } from 'solid-js'
import type { SetStoreFunction } from "solid-js/store"
import { Key } from '@solid-primitives/keyed'

export interface NoteData {
  /**
   * ノートのファイルストア
   */
  blobs: Record<string, Blob>
  /**
   * `JSON.parse`ができるデータ
   */
  canToJsonData: any
}
export interface Note <ComponentType extends NoteData> {
  /**
   * ノートのデータ。このデータが同じノートは、内容が同じでないといけない。
   */
  noteData: NoteData
  /**
   * ノートのデータをセットする
   */
  setNoteData: SetStoreFunction<NoteData>
  /**
   * ノートのコンポーネント
   */
  Component: (props: {
    noteData: ComponentType
    setNoteData: SetStoreFunction<ComponentType>
  }) => JSX.Element
  /**
   * Key
   */
  key: string | number
}

export interface NotesData {
  notes: Accessor<Note[]>
  setNotes: Setter<Note[]>
}

export const createNotes = (): NotesData => {
  const [notes, setNotes] = createSignal<Note[]>([])
  
  return {
    notes,
    setNotes,
  }
}

export interface Props {
  notes: Accessor<Note[]>
}
const Notes = (props: Props) => {
  return <div>
    <Key each={props.notes()} by={(note) => note.key}>{(note) => {
      return <div>
        {
          note().element
        }
      </div>
    }}</Key>
  </div>
}

export default Notes
