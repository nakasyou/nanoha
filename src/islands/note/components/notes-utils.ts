import { type Accessor, type Setter, createSignal } from 'solid-js'
import type { JSX } from 'solid-js/jsx-runtime'
import type { SetStoreFunction } from 'solid-js/store'
import type { Note0 } from '../utils/file-format/manifest-schema'
import type { ImageNoteData } from './notes/ImageNote/types'
import type { TextNoteData } from './notes/TextNote/types'

export type MargedNoteData = TextNoteData | ImageNoteData

export interface NoteData {
  /**
   * ノートのファイルストア
   */
  blobs: Record<string, Blob | undefined>
  /**
   * `JSON.parse`ができるデータ
   */
  canToJsonData: unknown
  /**
   * ノートのType
   */
  type: Note0['type']
  /**
   * ID
   */
  id: string
  /**
   * 更新日
   */
  timestamp: number
}

export interface NoteComponentProps<T extends MargedNoteData = MargedNoteData> {
  noteData: T
  setNoteData: SetStoreFunction<T>

  focus(): void

  updated(): void

  index: number
  notes: Note[]

  focusedIndex: number
}
export type NoteComponent<T extends MargedNoteData = MargedNoteData> = (
  props: NoteComponentProps<T>,
) => JSX.Element

export interface Note<T extends MargedNoteData = MargedNoteData> {
  Component: NoteComponent<T>

  noteData: T
  setNoteData: SetStoreFunction<T>
}

export const createNotes = (): {
  notes: Accessor<Note[]>
  setNotes: Setter<Note[]>
} => {
  const [notes, setNotes] = createSignal<Note[]>([])
  return {
    notes,
    setNotes,
  }
}
