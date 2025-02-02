import { Editor } from '@tiptap/core'
import { Underline } from '@tiptap/extension-underline'
import StarterKit from '@tiptap/starter-kit'
import DOMPurify from 'dompurify'
import {
  For,
  Show,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
} from 'solid-js'
import { icon } from '../../../../../utils/icons'
import { noteBookState } from '../../../store'
import type { NoteComponent, NoteComponentProps } from '../../notes-utils'
import { Dialog, createDialog } from '../../utils/Dialog'
import { Player } from './Player'
import { ExtensionPreviewLLM, ExtensionSheet } from './tiptap/plugins'
import type { TextNoteData } from './types'

import './TextNoteStyle.css'
import { getVisualViewport } from '../../../window-apis'
import { AIDialogCore } from './AI'

export const TextNote = ((props) => {
  let editorRef!: HTMLDivElement

  const [getEditor, setEditor] = createSignal<Editor>()

  const [getIsActiveSheet, setIsActiveSheet] = createSignal(false)
  const [getIsActiveBold, setIsActiveBold] = createSignal(false)
  const [getIsActiveUndlerline, setIsActiveUndlerline] = createSignal(false)
  const [getIsActive, setIsActive] = createSignal(false)
  const [getIsShowLlmPromptDialog, setIsShowLlmPromptDialog] =
    createSignal(false)

  const controllerItems = [
    {
      icon: icon('note'),
      toggle: 'toggleSheet',
      isActive: getIsActiveSheet,
      title: '隠す',
    },
    {
      icon: icon('bold'),
      toggle: 'toggleBold',
      isActive: getIsActiveBold,
      title: '太字にする',
    },
    {
      icon: icon('underline'),
      toggle: 'toggleUnderline',
      isActive: getIsActiveUndlerline,
      title: '下線をつける',
    },
  ] satisfies {
    icon: string
    toggle: keyof Editor['commands'] & `toggle${string}`
    isActive: () => boolean
    title: string
  }[]

  const startEditor = () => {
    if (!editorRef) {
      return
    }
    const editor = new Editor({
      element: editorRef,
      extensions: [
        StarterKit,
        ExtensionSheet({
          sheetClassName: '',
        }),
        ExtensionPreviewLLM,
        Underline,
      ],
      content: props.noteData.canToJsonData.html,
    })
    setEditor(editor)

    editor.on('transaction', () => {
      setIsActiveSheet(editor.isActive('sheet'))
      setIsActiveBold(editor.isActive('bold'))
      setIsActiveUndlerline(editor.isActive('underline'))
    })
    editor.on('update', () => {
      saveContent()
    })
  }

  onMount(() => {
    editorRef.onfocus = () => {
      props.focus()
    }
  })
  const saveContent = () => {
    props.setNoteData('timestamp', Date.now())
    props.setNoteData('canToJsonData', 'html', getEditor()?.getHTML() || '')
    props.updated()
  }

  createEffect(() => {
    setIsActive(props.focusedIndex === props.index)
  })

  let lastActive = getIsActive()
  createEffect(() => {
    if (getIsActive() && !lastActive) {
      setTimeout(() => {
        getEditor()?.commands.focus()
      }, 100)
    }
    lastActive = getIsActive()
  })

  createEffect(() => {
    const isActive = getIsActive()
    const editor = getEditor()
    if (isActive) {
      if (editor?.isDestroyed || !editor) {
        startEditor()
      }
    } else {
      editor?.destroy()
    }
  })

  const handleAltG = (evt: KeyboardEvent) => {
    if (evt.altKey && evt.key === 'g') {
      setIsShowLlmPromptDialog(true)
      evt.preventDefault()
    }
  }
  onMount(() => {
    document.addEventListener('keydown', handleAltG)
  })
  onCleanup(() => {
    document.removeEventListener('keydown', handleAltG)
  })

  const aiDialog = createDialog()
  return (
    <div>
      <Show when={getIsShowLlmPromptDialog()}>
        <Dialog
          onClose={() => {
            setIsShowLlmPromptDialog(false)
          }}
          type="custom"
          title="Generate with AI"
          okLabel="生成"
          dialog={aiDialog}
        >
          {(close) => (
            <AIDialogCore
              close={(r) => {
                getEditor()?.commands.insertContent(r)
                saveContent()
                close(null)
              }}
              initPrompt={(() => {
                const editor = getEditor()
                if (!editor) {
                  return ''
                }
                const { from, to, empty } = editor.state.selection
                if (empty) {
                  return
                }
                return editor.state.doc.textBetween(from, to, ' ')
              })()}
            />
          )}
        </Dialog>
      </Show>

      <Show when={!noteBookState.isEditMode}>
        <Player
          html={getEditor()?.getHTML() || props.noteData.canToJsonData.html}
        />
      </Show>

      <div
        classList={{
          hidden: !getIsActive() || !noteBookState.isEditMode,
        }}
      >
        <div class="textnote-tiptap-container nanohanote-textnote-styler break-words">
          <div
            id="editor"
            ref={editorRef}
            onFocusOut={saveContent}
            onInput={saveContent}
          />
        </div>
      </div>
      <div
        classList={{
          hidden: getIsActive() || !noteBookState.isEditMode,
        }}
        class="textnote-tiptap-container nanohanote-textnote-styler break-words"
      >
        <div
          innerHTML={DOMPurify.sanitize(props.noteData.canToJsonData.html)}
          class="min-h-5 p-2"
        />
      </div>

      <Show when={getIsActive()}>
        <div
          class="fixed left-0 w-full flex justify-center"
          style={{
            top: `${
              (getVisualViewport()?.data?.height ?? 0) +
              (getVisualViewport()?.data?.pageTop ?? 0) -
              32
            }px`,
          }}
        >
          <div />
          <div class="flex justify-center gap-2 p-1 pb-0 mb-1 rounded-md">
            <For each={controllerItems}>
              {(data) => (
                <button
                  class="grid drop-shadow-none"
                  onClick={() => {
                    getEditor()?.chain().focus()[data.toggle]().run()
                  }}
                  classList={{
                    'bg-secondary-container text-secondary rounded':
                      data.isActive(),
                  }}
                  type="button"
                  title={data.title}
                >
                  <div innerHTML={data.icon} class="w-8 h-8" />
                </button>
              )}
            </For>
            <button
              type="button"
              class="grid drop-shadow-none"
              onClick={() => setIsShowLlmPromptDialog(true)}
              title="AI 生成を利用する"
            >
              <div innerHTML={icon('sparkles')} class="w-8 h-8" />
            </button>
          </div>
          <div />
        </div>
      </Show>
    </div>
  )
}) satisfies NoteComponent<TextNoteData>
