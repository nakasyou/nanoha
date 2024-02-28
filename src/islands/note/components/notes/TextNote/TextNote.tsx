
import type { NoteComponent, NoteComponentProps } from '../../notes-utils'
import StarterKit from '@tiptap/starter-kit'
import type { TextNoteData } from './types'
import { ExtensionSheet } from './tiptap/PluginSheet'
import { Underline } from '@tiptap/extension-underline'
import {
  Match,
  Show,
  Switch,
  createEffect,
  createSignal,
  onMount
} from 'solid-js'
import { removeIconSize } from '../../../utils/icon/removeIconSize'
import * as marked from "marked"

import IconNote from '@tabler/icons/note.svg?raw'
import IconBold from '@tabler/icons/bold.svg?raw'
import IconUnderline from '@tabler/icons/underline.svg?raw'

import { Editor, textPasteRule } from '@tiptap/core'
import { Dialog, createDialog } from '../../utils/Dialog'
import { Controller } from '../../note-components/Controller'
import { noteBookState } from '../../../store'
import { Player } from './Player'

import './TextNoteStyle.css'
import type { SetStoreFunction } from 'solid-js/store'
import { getVisualViewport } from '../../../window-apis'
import { generateByGemini } from '../../../utils/gemini'

export interface Props extends NoteComponentProps {
  noteData: TextNoteData
  setNoteData: SetStoreFunction<TextNoteData>
}

export const TextNote = ((props: Props) => {
  let editorRef!: HTMLDivElement

  const [getEditor, setEditor] = createSignal<Editor>()

  const [getIsFocused, setIsFocused] = createSignal(false)
  const [getIsActiveSheet, setIsActiveSheet] = createSignal(false)
  const [getIsActiveBold, setIsActiveBold] = createSignal(false)
  const [getIsActiveUndlerline, setIsActiveUndlerline] = createSignal(false)

  onMount(() => {
    const editor = new Editor({
      element: editorRef,
      extensions: [
        StarterKit,
        ExtensionSheet({
          sheetClassName: ''
        }),
        Underline
      ],
      content: props.noteData.canToJsonData.html
    })
    setEditor(editor)

    editor.on('focus', (evt) => {
      setIsFocused(evt.editor.isFocused)
    })
    editor.on('transaction', () => {
      setIsActiveSheet(editor.isActive('sheet'))
      setIsActiveBold(editor.isActive('bold'))
      setIsActiveUndlerline(editor.isActive('underline'))
    })
  })

  const [isActive, setIsActive] = createSignal(false)

  props.on('focus', (evt) => {
    setIsActive(evt.isActive)
  })

  createEffect(() => {
    const isFocused = getIsFocused() || false
    if (isFocused) {
      // このノートがFocusしたことを他のノートに伝える
      props.focus()
    }
  })

  const [isShowCloseDialog, setIsShowCloseDialog] = createSignal(false)
  const saveContent = () => {
    props.setNoteData('canToJsonData', 'html', getEditor()?.getHTML() || '')
    props.updated()
  }

  const [getIsGeminiShowed, setIsGeminiShowed] = createSignal(false)
  const geminiDialog = createDialog()
  return (
    <div>
      <Show when={getIsGeminiShowed()}>
        <Dialog dialog={geminiDialog} title="Generate with Gemini" type="custom" onClose={data => {
          setIsGeminiShowed(false)
        }}>
          <div>
            {
              (() => {
                const [getPrompt, setPrompt] = createSignal('')
                const [getGenerating, setGenerating] = createSignal(false)
                return <div>
                  <textarea placeholder='Prompt' onInput={e => setPrompt(e.target.value)} />
                  <button onClick={async () => {
                    setGenerating(true)
                    const prompt = getPrompt()
                    const text = await generateByGemini(`「${prompt}」についてのテキストを作成してください。また、作ったテキスト中の年代・地名・語句などの重要な単語は、\`((\`と\`))\`で囲みなさい、これは、1文に1つ以上入れなさい。`)

                    const html = marked.parse(text.replace(/\(\(.*?\)\)/g, str => {
                      return '<span data-nanohasheet="true">' + str.slice(2, -2) + '</span>'
                    }))
                    console.log(html)
                    getEditor()?.commands.insertContent(html)
                    setGenerating(false)
                    geminiDialog.close(0)
                  }} disabled={getGenerating()}>Generate</button>
                  <Show when={getGenerating()}>
                    Genetating...
                  </Show>
                </div>
              })()
            }
          </div>
        </Dialog>
      </Show>
      <Show when={!noteBookState.isEditMode}>
        <div>
          <Player html={getEditor()?.getHTML() || ''} />
        </div>
      </Show>
      <div
        classList={{
          hidden: !noteBookState.isEditMode
        }}
      >
        {isShowCloseDialog() && (
          <Dialog
            onClose={(result) => {
              if (result) {
                // 消していいいらしい
                props.removeNote()
              }
              setIsShowCloseDialog(false)
            }}
            type="confirm"
            title="削除しますか?"
          >
            ノートを削除すると、元に戻せなくなる可能性があります。
          </Dialog>
        )}
        <div>
          <div
            id="editor"
            ref={editorRef}
            onFocusOut={saveContent}
            onInput={saveContent}
            class="textnote-tiptap-container rounded my-2 border boader-outlined nanohanote-textnote-styler"
          />
        </div>
        <Show when={isActive()}>
          <div class="flex flex-col justify-center gap-2">
            <div class="flex justify-center gap-2 fixed left-0 w-full" style={{
              top: (getVisualViewport()?.data?.height ?? 0) + (getVisualViewport()?.data?.pageTop ?? 0) - 32 + 'px'
            }}>
              <div class="flex justify-center">
              {
                ([
                  {
                    icon: IconNote,
                    toggle: 'toggleSheet',
                    isActive: getIsActiveSheet
                  },
                  {
                    icon: IconBold,
                    toggle: 'toggleBold',
                    isActive: getIsActiveBold
                  },
                  {
                    icon: IconUnderline,
                    toggle: 'toggleUnderline',
                    isActive: getIsActiveUndlerline
                  }
                ] satisfies ({
                  icon: string
                  toggle: keyof Editor['commands']
                  isActive: () => boolean
                }[])).map((data) => {
                  return <button
                    class="grid drop-shadow-none"
                    onClick={() => {
                      getEditor()?.chain().focus()[data.toggle]().run()
                    }}
                    classList={{
                      'bg-secondary-container text-secondary rounded': data.isActive()
                    }}
                  >
                    <div innerHTML={removeIconSize(data.icon)} class="w-8 h-8" />
                  </button>
                })
              }
              </div>
              <div>

              </div>
              <div>
                <button onClick={async () => {
                  setIsGeminiShowed(true)
                }}>Generate</button>
              </div>
            </div>
            <Controller
              noteIndex={props.index}
              notesLength={props.notes.length}
              onRemove={() => setIsShowCloseDialog(true)}
              onUpNote={() => props.up()}
              onDownNote={() => props.down()}
            />
          </div>
        </Show>
      </div>
    </div>
  )
}) satisfies NoteComponent
