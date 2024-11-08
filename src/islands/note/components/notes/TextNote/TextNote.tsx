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
import dedent from 'dedent'
import markdownIt from 'markdown-it'
import type { SetStoreFunction } from 'solid-js/store'
import { getGoogleGenerativeAI } from '../../../../shared/gemini'
import { getVisualViewport } from '../../../window-apis'
import { AIDialogCore } from './AI'

const markdownParser = markdownIt()

export const TextNote = ((props) => {
  let editorRef!: HTMLDivElement

  const [getEditor, setEditor] = createSignal<Editor>()

  const [getIsActiveSheet, setIsActiveSheet] = createSignal(false)
  const [getIsActiveBold, setIsActiveBold] = createSignal(false)
  const [getIsActiveUndlerline, setIsActiveUndlerline] = createSignal(false)
  const [getIsActive, setIsActive] = createSignal(false)
  const [getIsShowLlmPromptDialog, setIsShowLlmPromptDialog] =
    createSignal(false)
  const [getPrompt, setPrompt] = createSignal('')
  const [getImageBlobToGenerate, setImageBlobToGenarate] = createSignal<Blob>()
  const [getGenerateMode, setGenerateMode] = createSignal<'text' | 'image'>(
    'text',
  )

  const controllerItems = [
    {
      icon: icon('note'),
      toggle: 'toggleSheet',
      isActive: getIsActiveSheet,
    },
    {
      icon: icon('bold'),
      toggle: 'toggleBold',
      isActive: getIsActiveBold,
    },
    {
      icon: icon('underline'),
      toggle: 'toggleUnderline',
      isActive: getIsActiveUndlerline,
    },
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

  props.on('focus', (evt) => {
    setIsActive(evt.isActive)
  })

  let lastActive = getIsActive()
  createEffect(() => {
    if (getIsActive() && !lastActive) {
      requestAnimationFrame(() => {
        getEditor()?.commands.focus()
      })
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

  const insertWithGenerate = async (prompt: string) => {
    const editor = getEditor()
    if (!editor) {
      return
    }
    //editor.chain().insertContent(``).focus().run()
    const ai = getGoogleGenerativeAI()
    if (!ai) {
      if (confirm('AI 機能が設定されていません。\n設定を開きますか？')) {
        location.href = '/app/settings#ai'
      }
      return
    }
    const image = getGenerateMode() === 'image' && getImageBlobToGenerate()
    const model = ai.getGenerativeModel({
      model: image ? 'gemini-1.5-pro' : 'gemini-1.5-flash',
    })
    const stream = image
      ? await model
          .startChat({
            systemInstruction: {
              role: 'model',
              parts: [
                {
                  text: dedent`画像を抽出し、そっくりそのまま書き出しなさい。省略せずに画像の文字全てを書き出すこと。画像に書いていないことは書かないこと。`,
                },
              ],
            },
          })
          .sendMessageStream([
            {
              text: prompt,
            },
            {
              inlineData: {
                mimeType: image.type,
                data: await new Promise<string>((resolve) => {const reader = new FileReader();reader.onloadend = () =>resolve((reader.result as string).split(',')[1]!);reader.readAsDataURL(image)}),
              },
            },
          ])
      : await model
          .startChat({
            systemInstruction: {
              role: 'model',
              parts: [
                {
                  text: 'ユーザーの指示に基づき、暗記の手助けになる赤シート用文章を生成しなさい。赤シートで隠すべき単語は、Markdownの太字機能で表現しなさい。隠す必要がない場所には太字は使わないでください。',
                },
              ],
            },
          })
          .sendMessageStream(prompt)
    insertFromStream(
      (async function* () {
        for await (const chunk of stream.stream) {
          yield chunk.text()
        }
      })(),
    )
  }
  const insertFromStream = async (
    stream: AsyncGenerator<string, void, unknown>,
  ) => {
    const editor = getEditor()
    if (!editor) {
      return
    }
    const paragraphId = Math.random().toString()
    editor.commands.setNode('llmpreview', { id: paragraphId })
    const pre = editor.$node('llmpreview', { id: paragraphId })!
    pre.content = '生成中...'
    let rawText = ''
    for await (const text of stream) {
      rawText += text
      pre.content = rawText //markdownParser.render(rawText)
    }
    editor.commands.deleteNode(pre.node.type)
    //pre.content = ''
    editor.commands.insertContent(
      markdownParser.render(rawText.replace(/\*\*[\s\S]*?\*\*/g,(str) => `((${str.slice(2, -2)}))`,),).replace(/\(\([\s\S]*?\)\)/g,(str) => `<span data-nanohasheet="true">${str.slice(2, -2)}</span>`,),
    )
    saveContent()
  }

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
          onClose={(result) => {
            setIsShowLlmPromptDialog(false)
            if (result) {
              insertWithGenerate(getPrompt())
            }
          }}
          type="custom"
          title="Generate with AI"
          okLabel="生成"
          dialog={aiDialog}
        >
          {(close) => <AIDialogCore close={(r) => {
            getEditor()?.commands.insertContent(r)
            close(null)
          }} />}
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
                      data.isActive(),
                  }}
                  type="button"
                >
                  <div innerHTML={data.icon} class="w-8 h-8" />
                </button>
              )}
            </For>
            <button
              type="button"
              class="grid drop-shadow-none"
              onClick={() => setIsShowLlmPromptDialog(true)}
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
