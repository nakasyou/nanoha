import type { NoteComponent, NoteComponentProps } from '../../notes-utils'
import StarterKit from '@tiptap/starter-kit'
import type { TextNoteData } from './types'
import { ExtensionSheet, ExtensionPreviewLLM } from './tiptap/plugins'
import { Underline } from '@tiptap/extension-underline'
import {
  For,
  Show,
  createEffect,
  createSignal,
  onMount
} from 'solid-js'
import { removeIconSize } from '../../../utils/icon/removeIconSize'

import IconNote from '@tabler/icons/outline/note.svg?raw'
import IconBold from '@tabler/icons/outline/bold.svg?raw'
import IconUnderline from '@tabler/icons/outline/underline.svg?raw'
import IconSparkles from '@tabler/icons/outline/sparkles.svg?raw'

import { Editor, } from '@tiptap/core'
import { Dialog } from '../../utils/Dialog'
import { Controller } from '../../note-components/Controller'
import { noteBookState } from '../../../store'
import { Player } from './Player'

import './TextNoteStyle.css'
import type { SetStoreFunction } from 'solid-js/store'
import { getVisualViewport } from '../../../window-apis'
import { generateWithLLM } from '../../../../shared/ai'
import markdownIt from 'markdown-it'

const markdownParser = markdownIt()

export interface Props extends NoteComponentProps {
  noteData: TextNoteData
  setNoteData: SetStoreFunction<TextNoteData>
}

export const TextNote = ((props: Props) => {
  let editorRef!: HTMLDivElement

  const [getEditor, setEditor] = createSignal<Editor>()

  const [getIsActiveSheet, setIsActiveSheet] = createSignal(false)
  const [getIsActiveBold, setIsActiveBold] = createSignal(false)
  const [getIsActiveUndlerline, setIsActiveUndlerline] = createSignal(false)
  const [getIsActive, setIsActive] = createSignal(false)
  const [isShowCloseDialog, setIsShowCloseDialog] = createSignal(false)
  const [getIsShowLlmPromptDialog, setIsShowLlmPromptDialog] = createSignal(false)
  const [getPrompt, setPrompt] = createSignal('')

  const controllerItems = [
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
  ] satisfies {
    icon: string
    toggle: keyof Editor['commands'] & `toggle${string}`
    isActive: () => boolean
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
          sheetClassName: ''
        }),
        ExtensionPreviewLLM,
        Underline
      ],
      content: props.noteData.canToJsonData.html
    })
    setEditor(editor)

    editor.on('transaction', () => {
      setIsActiveSheet(editor.isActive('sheet'))
      setIsActiveBold(editor.isActive('bold'))
      setIsActiveUndlerline(editor.isActive('underline'))
    })
  }

  onMount(() => {
    editorRef.onfocus = () => {
      props.focus()
    }
  })
  const saveContent = () => {
    props.setNoteData('canToJsonData', 'html', getEditor()?.getHTML() || '')
    props.updated()
  }

  props.on('focus', (evt) => {
    setIsActive(evt.isActive)
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

  const insertWithGenerate = async (prompt: string) => {
    const editor = getEditor()
    if (!editor) {
      return
    }
    const paragraphId = Math.random().toString()
    editor.commands.setNode('llmpreview', { id: paragraphId })
    const pre = editor.$node('llmpreview', { id: paragraphId })!
    const stream = generateWithLLM(`あなたは学習用テキスト生成AIです。
Write about the last matter, observing the following caveats.
- Answer in line with the language of the question.
- Output in Markdown. 人物、年号、名詞、地名やその他などの重要な部分は、

> ((important word))

のように二重括弧で囲みなさい。重要部分は、1回答に最低でも2個入れなさい。

User request (write an answer using request language):
${prompt}`)
    if (!stream) {
      if (confirm('AI 機能が設定されていません。\n設定を開きますか？')) {
        location.href = '/app/settings#ai'
      }
      return
    }
    let rawText = ''
    for await (const text of stream) {
      rawText += text
      pre.content = rawText//markdownParser.render(rawText)
    }
    editor.commands.deleteNode(pre.node.type)
    //pre.content = ''
    editor.commands.insertContent(
      markdownParser.render(rawText)
        .replace(/\(\([\s\S]*?\)\)/g, str => `<span data-nanohasheet="true">${str.slice(2, -2)}</span>`)
    )
  }
  return (
    <div class="my-2">
      <Show when={isShowCloseDialog()}>
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
      </Show>
      <Show when={getIsShowLlmPromptDialog()}>
        <Dialog onClose={(result) => {
          setIsShowLlmPromptDialog(false)
          if (result) {
            insertWithGenerate(getPrompt())
          }
        }} type='confirm' title='Generate with AI' okLabel='生成'>
          <div>
            <label>
              <div>AIに入力するプロンプトを入力:</div>
              <textarea placeholder='水の電気分解について、小学生でもわかるように説明して...' oninput={(evt) => {
                setPrompt(evt.currentTarget.value)
              }} class='border rounded-lg w-full p-1 border-outlined bg-surface'></textarea>
            </label>
          </div>
        </Dialog>
      </Show>

      <Show when={!noteBookState.isEditMode}>
        <Player html={getEditor()?.getHTML() || ''} />
      </Show>

      <div
        classList={{
          hidden: !getIsActive() || !noteBookState.isEditMode
        }}
      >
        <div class="textnote-tiptap-container rounded my-2 border boader-outlined nanohanote-textnote-styler">
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
          hidden: getIsActive() || !noteBookState.isEditMode
        }}
      >
        <div
          innerHTML={props.noteData.canToJsonData.html}
          class="rounded p-2 border boader-outlined"
          onClick={() => {
            props.focus()
          }}
        />
      </div>

      <Show when={getIsActive()}>
        <div
          class="fixed left-0 w-full flex justify-center"
          style={{
            top:
              (getVisualViewport()?.data?.height ?? 0) +
              (getVisualViewport()?.data?.pageTop ?? 0) -
              32 +
              'px'
          }}
        >
          <div />
          <div class="flex justify-center gap-2 bg-white p-1 pb-0 mb-1 rounded-md">
            <For each={controllerItems}>
              {(data) => (
                <button
                  class="grid drop-shadow-none"
                  onClick={() => {
                    getEditor()?.chain().focus()[data.toggle]().run()
                  }}
                  classList={{
                    'bg-secondary-container text-secondary rounded':
                      data.isActive()
                  }}
                >
                  <div innerHTML={removeIconSize(data.icon)} class="w-8 h-8" />
                </button>
              )}
            </For>
            <button
              class="grid drop-shadow-none"
              onClick={() => {
                setIsShowLlmPromptDialog(true)
              }}
            >
              <div innerHTML={removeIconSize(IconSparkles)} class="w-8 h-8" />
            </button>
          </div>
          <div />
        </div>
        <Controller
          noteIndex={props.index}
          notesLength={props.notes.length}
          onRemove={() => setIsShowCloseDialog(true)}
          onUpNote={() => props.up()}
          onDownNote={() => props.down()}
        />
      </Show>
    </div>
  )
}) satisfies NoteComponent
