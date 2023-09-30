import { For, createSignal } from "solid-js"
import type { Accessor, Setter, JSX } from 'solid-js'
import type { SetStoreFunction } from "solid-js/store"

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
export interface Note {
  /**
   * ノートのデータ。このデータが同じノートは、内容が同じでないといけない。
   */
  noteData: NoteData
  /**
   * ノートのデータをセットする
   */
  setNoteData: SetStoreFunction<NoteData>
  /**
   * ノートのエレメント
   */
  element: JSX.Element
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
  notes: NotesData
}
const Notes = (props: Props) => {
  
  return <div>
    <For each={props.notes.notes()}>{(note) => {
      return <div>
        {
          note.element
        }
      </div>
    }}</For>
  </div>
}
export default Notes
