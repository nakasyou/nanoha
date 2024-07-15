import {
  createSignal,
  type Accessor,
  type Setter,
  type JSX,
  createEffect,
  Show,
  onMount,
} from 'solid-js'
import { Key } from '@solid-primitives/keyed'
import { moveArray } from '../utils/array/moveArray'

import type { Note } from './notes-utils'
import { noteBookState, notes, setNoteBookState } from '../store'
import { Controller } from './note-components/Controller'
import { Dialog } from './utils/Dialog'
import iconGripHorizontal from '@tabler/icons/outline/grip-horizontal.svg?raw'
import iconX from '@tabler/icons/outline/x.svg?raw'
import { removeIconSize } from '../utils/icon/removeIconSize'

export default (props: {
  notes: Note[]
  setNotes: Setter<Note[]>
}) => {
  const [getFocusedIndex, setFocusedIndex] = createSignal(0)
  const [getIndexToRemove, setIndexToRemove] = createSignal<null | number>(null)

  const handleUpdate = () => {
    setNoteBookState('isSaved', false)
  }
  createEffect(() => {
    notes.notes
    handleUpdate()
  })

  const getNoteRect: Record<string, () => DOMRect> = {}

  const [getDraggedNoteIndex, setDraggedNoteIndex] = createSignal<
    number | null
  >(null)
  const [getDraggedNoteYPosition, setDraggedNoteYPosition] = createSignal<
    number | null
  >(null)
  const [getDragTarget, setDragTarget] = createSignal<number | null>(null)
  const [getIsDragUp, setIsDragUp] = createSignal(false)
  return (
    <div class="flex flex-col gap-2 my-2">
      <Show when={getIndexToRemove() !== null}>
        <Dialog
          type="confirm"
          onClose={(result) => {
            const indexToRemove = getIndexToRemove()
            setIndexToRemove(null)
            if (!result) {
              return
            }
            if (indexToRemove === null) {
              return
            }
            const newNotes = [...props.notes]
            newNotes.splice(indexToRemove, 1)
            props.setNotes(newNotes)
            setIndexToRemove(null)
          }}
          title="ノートを削除しますか？"
        >
          削除すると、もとに戻せない可能性があります。
        </Dialog>
      </Show>
      <Key each={props.notes} by={(note) => note.noteData.id}>
        {(note, index) => {
          const nowNote = note()
          const NoteComponent = nowNote.Component
          createEffect(() => {
            nowNote.noteData
            handleUpdate()
          })
          const noteElement = (
            <div class="border p-1 grow">
              <NoteComponent
                noteData={note().noteData}
                setNoteData={note().setNoteData}
                focus={() => {
                  for (const eachNote of props.notes) {
                    const isActive = eachNote.noteData.id === note().noteData.id
                    for (const focusEventListener of eachNote.events.focus ||
                      []) {
                      focusEventListener({
                        isActive,
                      })
                    }
                    if (isActive) {
                      setFocusedIndex(index)
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
                index={index()}
                notes={props.notes}
              />
            </div>
          )
          let notePosition!: HTMLDivElement
          let noteElem!: HTMLDivElement

          let downedPointerId: number | null = null
          const getRectCenterY = (rect: DOMRect) => rect.top + rect.height / 2
          const calcTarget = () => {
            const thisNoteRect = notePosition.getBoundingClientRect()
            const draggingRect = noteElem.getBoundingClientRect()

            const isUP = thisNoteRect.top > draggingRect.top
            setIsDragUp(isUP)

            const noteRects: DOMRect[] = []
            for (const {
              noteData: { id },
            } of props.notes) {
              noteRects.push(getNoteRect[id]!())
            }
            if (isUP) {
              for (let i = 0; i < index(); i++) {
                const rect = noteRects[i]!
                if (getRectCenterY(draggingRect) < getRectCenterY(rect)) {
                  setDragTarget(i)
                  return
                }
              }
            } else {
              for (let i = noteRects.length - 1; i > index(); i--) {
                const rect = noteRects[i]!
                if (getRectCenterY(draggingRect) > getRectCenterY(rect)) {
                  return setDragTarget(i)
                }
              }
            }
            setDragTarget(index())
          }
          onMount(() => {
            getNoteRect[note().noteData.id] = () =>
              noteElem.getBoundingClientRect()
          })
          const [getDraggable] = createSignal<JSX.Element | null>(
            <div class="h-24 bg-blue-300" />,
          )
          return (
            <>
              <Show when={index() === getDragTarget() && getIsDragUp()}>
                {getDraggable()}
              </Show>
              <div ref={notePosition} />
              <div
                class="flex flex-col"
                ref={noteElem}
                classList={{
                  fixed: getDraggedNoteIndex() === index(),
                }}
                style={{
                  ...(getDraggedNoteIndex() === index()
                    ? {
                        top: `${getDraggedNoteYPosition()}px`,
                      }
                    : {}),
                }}
              >
                <Show when={noteBookState.isEditMode && getFocusedIndex() === index()}>
                  <div class="flex gap-1">
                    <button
                      type="button"
                      onPointerDown={(e) => {
                        downedPointerId = e.pointerId
                        setDragTarget(index())
                        setDraggedNoteYPosition(e.clientY)
                        setDraggedNoteIndex(index())
                        calcTarget()
                      }}
                      onPointerMove={(e) => {
                        if (downedPointerId === e.pointerId) {
                          const target = e.currentTarget as HTMLButtonElement
                          target.setPointerCapture(e.pointerId)
                          setDraggedNoteYPosition(e.clientY)
                          calcTarget()
                        }
                      }}
                      onPointerUp={() => {
                        props.setNotes(
                          moveArray(props.notes, index(), getDragTarget() ?? 0),
                        )
                        downedPointerId = null
                        setDraggedNoteIndex(null)
                        setDraggedNoteYPosition(null)
                        setDragTarget(null)
                      }}
                      class="touch-none w-8 h-8 text-gray-400"
                      innerHTML={removeIconSize(iconGripHorizontal)}
                    />
                    <button type="button" onClick={() => {
                      setIndexToRemove(index())
                    }} class="touch-none w-8 h-8" innerHTML={removeIconSize(iconX)} />
                  </div>
                </Show>
                {noteElement}
              </div>
              <Show when={index() === getDragTarget() && !getIsDragUp()}>
                {getDraggable()}
              </Show>
            </>
          )
        }}
      </Key>
    </div>
  )
}
