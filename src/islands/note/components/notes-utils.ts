import { createSignal, type Accessor, type Setter } from 'solid-js'
import type { JSX } from 'solid-js/jsx-runtime'
import type { Note0 } from '../utils/file-format/manifest-schema'
import type { SetStoreFunction } from 'solid-js/store'
import type { TextNoteData } from './notes/TextNote/types'
import type { ImageNoteData } from './notes/ImageNote/types'

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
}

export interface NoteComponentProps<T extends MargedNoteData = MargedNoteData> {
  noteData: T
  setNoteData: SetStoreFunction<T>

  focus(): void
  on<EventType extends keyof NoteEvents>(
    type: EventType,
    listenter: (evt: NoteEventArgs[EventType]) => void,
  ): void

  updated(): void

  index: number
  notes: Note[]
}
export type NoteComponent<T extends MargedNoteData = MargedNoteData> = (
  props: NoteComponentProps<T>
) => JSX.Element

export interface NoteEvents {
  focus?: ((evt: NoteEventArgs['focus']) => void)[]
}
export interface NoteEventArgs {
  focus: {
    isActive: boolean
  }
}
export interface Note {
  Component: NoteComponent

  noteData: NoteData
  setNoteData: SetStoreFunction<NoteData>

  events: NoteEvents
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
