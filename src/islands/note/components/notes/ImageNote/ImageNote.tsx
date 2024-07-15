import type { NoteComponent, NoteComponentProps } from '../../notes-utils'
import type { SetStoreFunction } from 'solid-js/store'
import type { ImageNoteData } from './types'
import { Show, createMemo, createSignal } from 'solid-js'

import { Dialog } from '../../utils/Dialog'
import { Controller } from '../../note-components/Controller'
import { noteBookState, setNoteBookState } from '../../../store'
import { ScanedImageEditor } from './components/ScanedImageEditor'
import Player from './components/Player'

export const ImageNote = ((props) => {
  const [getIsActive, setIsActive] = createSignal(false)

  props.on('focus', (evt) => {
    setIsActive(evt.isActive)
  })
  const imageUrl = createMemo(() => {
    const nowImageBlob = props.noteData.blobs.scanedImage
    return nowImageBlob ? URL.createObjectURL(nowImageBlob) : null
  })
  const [isShowEditor, setIsShowEditor] = createSignal(false)
  return (
    <div>
      {/* $ダイアログとか */}
      <Show when={isShowEditor()}>
        <ScanedImageEditor
          onEnd={(data) => {
            setIsShowEditor(false)
            if (!data) {
              return
            }
            props.setNoteData('blobs', 'scanedImage', data.image)
            props.setNoteData('canToJsonData', 'sheets', data.sheets)
            props.updated()
          }}
          noteData={props.noteData}
          setNoteData={props.setNoteData}
        />
      </Show>
      {/* /ダイアログとか */}

      {/* 本体 */}
      <div
        onClick={() => {
          if (noteBookState.isEditMode) {
            props.focus()
            setIsShowEditor(true)
          }
        }}
      >
        <Show
          when={noteBookState.isEditMode}
          fallback={
            <div>
              <Player
                imageBlob={props.noteData.blobs.scanedImage!!!}
                sheetsData={props.noteData.canToJsonData.sheets!!!}
                imageUrl={imageUrl()!!!}
                viewMode={noteBookState.isEditMode}
              />
            </div>
          }
        >
          {/*編集モード*/}
          <Show
            when={getIsActive()}
            fallback={
              // アクティブでない -> Preview
              <Show
                fallback={
                  <div class="text-center text-2xl">
                    まだスキャンされていません
                  </div>
                }
                when={
                  props.noteData.blobs.scanedImage &&
                  props.noteData.canToJsonData.sheets
                }
              >
                <img
                  src={imageUrl()!!!}
                  alt="preview"
                  class="w-full h-full"
                />
              </Show>
            }
          >
            {/*アクティブ*/}
            <Show
              fallback={
                <div class="text-center">
                  <div class="text-xl">ImageNote</div>
                  <div>まだスキャンされていません</div>
                  <div class="my-2 flex justify-center">
                    <button
                      class="outlined-button"
                      onClick={() => {
                        setIsShowEditor(true)
                      }}
                      type='button'
                    >
                      スキャン
                    </button>
                  </div>
                </div>
              }
              when={
                props.noteData.blobs.scanedImage &&
                props.noteData.canToJsonData.sheets
              }
            >
              <Player
                imageBlob={props.noteData.blobs.scanedImage!!!}
                sheetsData={props.noteData.canToJsonData.sheets!!!}
                imageUrl={imageUrl()!!!}
                viewMode={noteBookState.isEditMode}
              />
            </Show>
          </Show>
        </Show>
      </div>
    </div>
  )
}) satisfies NoteComponent<ImageNoteData>
