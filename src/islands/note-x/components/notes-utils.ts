import { createSignal, type Accessor, type Setter } from "solid-js"
import type { JSX } from 'solid-js/jsx-runtime'
import type { Note0 } from "../utils/file-format/manifest-schema"

export interface NoteData <CanToJsonData extends any = any> {
  /**
   * ノートのファイルストア
   */
  blobs: Record<string, Blob>
  /**
   * `JSON.parse`ができるデータ
   */
  canToJsonData: CanToJsonData
  /**
   * ノートのType
   */
  type: Note0['type']
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
