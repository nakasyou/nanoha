import { createSignal, type Accessor, type Setter } from "solid-js"
import type { JSX } from 'solid-js/jsx-runtime'
import type { Note0 } from "../utils/file-format/manifest-schema"
import type { SetStoreFunction } from 'solid-js/store'
import type { TextNoteData } from "./notes/TextNote/types"
import type { ImageNoteData } from "./notes/ImageNote/types"

export interface NoteData <
  CanToJsonData extends any = any,
  BlobStore extends string = string
> {
  /**
   * ノートのファイルストア
   */
  blobs: Partial<Record<BlobStore, Blob | undefined>>
  /**
   * `JSON.parse`ができるデータ
   */
  canToJsonData: CanToJsonData
  /**
   * ノートのType
   */
  type: string
  id: string
}

export type MargedNote = TextNoteData | ImageNoteData

export interface NoteComponentProps <
  CanToJsonData extends any = any,
  BlobStore extends string = string
> {
  noteData: NoteData<CanToJsonData, BlobStore>
  setNoteData: SetStoreFunction<NoteData<CanToJsonData, BlobStore>>

  focus (): void
  on <EventType extends keyof NoteEvents>(type: EventType, listenter: (evt: NoteEventArgs[EventType]) => void): void
  removeNote (): void

  updated (): void
  
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
  Component: NoteComponent<CanToJsonData>

  noteData: NoteData
  setNoteData: SetStoreFunction<NoteData<CanToJsonData>>

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
