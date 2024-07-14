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
  onMount,
  onCleanup,
} from 'solid-js'
import { removeIconSize } from '../../../utils/icon/removeIconSize'
import IconNote from '@tabler/icons/outline/note.svg?raw'
import IconBold from '@tabler/icons/outline/bold.svg?raw'
import IconUnderline from '@tabler/icons/outline/underline.svg?raw'
import IconSparkles from '@tabler/icons/outline/sparkles.svg?raw'

import DOMPurify from 'dompurify'
import { Editor } from '@tiptap/core'
import { Dialog } from '../../utils/Dialog'
import { noteBookState } from '../../../store'
import { Player } from './Player'

import './TextNoteStyle.css'
import type { SetStoreFunction } from 'solid-js/store'
import { getVisualViewport } from '../../../window-apis'
import { getGoogleGenerativeAI } from '../../../../shared/gemini'
import markdownIt from 'markdown-it'
import dedent from 'dedent'

const markdownParser = markdownIt()

export interface Props extends NoteComponentProps {
  noteData: TextNoteData
  setNoteData: SetStoreFunction<TextNoteData>
}

export const TextNote = ((props: Props) => {
  let editorRef!: HTMLDivElement
  let llmTextArea!: HTMLTextAreaElement

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
      icon: IconNote,
      toggle: 'toggleSheet',
      isActive: getIsActiveSheet,
    },
    {
      icon: IconBold,
      toggle: 'toggleBold',
      isActive: getIsActiveBold,
    },
    {
      icon: IconUnderline,
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
                  text: dedent`画像を抽出し、そっくりそのまま書き出しなさい。その文章のうち、赤シートとして隠せる単語はMarkdownの太字機能で表現しなさい。省略せずに画像の文字全てを書き出すこと。`,
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
                data: await new Promise<string>((resolve) => {
                  const reader = new FileReader()
                  reader.onloadend = () =>
                    resolve((reader.result as string).split(',')[1]!)
                  reader.readAsDataURL(image)
                }),
              },
            },
          ])
      : await model
          .startChat({
            systemInstruction: {
              role: 'model',
              parts: [
                {
                  text: `ユーザーの指示に基づき、暗記の手助けになる赤シート用文章を生成しなさい。赤シートで隠すべき単語は、Markdownの太字機能で表現しなさい。隠す必要がない場所には太字は使わないでください。`,
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
    console.log(editor, paragraphId)
    const pre = editor.$node('llmpreview', { id: paragraphId })!
    pre.content = '生成中...'
    let rawText = ''
    for await (const text of stream) {
      rawText += text
      pre.content = rawText//markdownParser.render(rawText)
    }
    editor.commands.deleteNode(pre.node.type)
    //pre.content = ''
    editor.commands.insertContent(
      markdownParser
        .render(
          rawText.replace(
            /\*\*[\s\S]*?\*\*/g,
            (str) => `((${str.slice(2, -2)}))`,
          ),
        )
        .replace(
          /\(\([\s\S]*?\)\)/g,
          (str) => `<span data-nanohasheet="true">${str.slice(2, -2)}</span>`,
        ),
    )
    saveContent()
  }
  const openGenerateDialog = () => {
    const editor = getEditor()
    if (!editor) {
      return
    }
    setPrompt('')
    setImageBlobToGenarate(void 0)
    setIsShowLlmPromptDialog(true)
    llmTextArea.focus()

    const { from, to, empty } = editor.state.selection
    if (empty) {
      return
    }
    llmTextArea.value = editor.state.doc.textBetween(from, to, ' ')
    llmTextArea.select()
  }

  const handleAltG = (evt: KeyboardEvent) => {
    if (evt.altKey && evt.key === 'g') {
      openGenerateDialog()
      evt.preventDefault()
    }
  }
  onMount(() => {
    document.addEventListener('keydown', handleAltG)
  })
  onCleanup(() => {
    document.removeEventListener('keydown', handleAltG)
  })
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
          type="confirm"
          title="Generate with AI"
          okLabel="生成"
        >
          {(close) => (
            <div>
              <div class="grid grid-cols-2 place-items-center">
                <button
                  class="border-b w-full"
                  onClick={() => setGenerateMode('text')}
                >
                  テキストから生成
                </button>
                <button
                  class="border-b w-full"
                  onClick={() => setGenerateMode('image')}
                >
                  写真をスキャンして生成
                </button>
                <div
                  class="border-t border-primary w-full transition-transform duration-200 ease-in -translate-y-px"
                  classList={{
                    'translate-x-full': getGenerateMode() === 'image',
                  }}
                ></div>
              </div>
              <Show when={getGenerateMode() === 'image'}>
                {(() => {
                  let imageInput!: HTMLInputElement
                  const [getCapture, setCapture] = createSignal<
                    string | undefined
                  >(void 0)
                  return (
                    <div>
                      <div class="text-xl text-center">画像を選択:</div>
                      <div class="p-2">
                        <Show when={getImageBlobToGenerate()}>
                          <div class="grid place-items-center">
                            <img
                              class="max-h-[30dvh] max-w-full"
                              src={URL.createObjectURL(
                                getImageBlobToGenerate()!,
                              )}
                              alt={getImageBlobToGenerate()!.name}
                            />
                          </div>
                          <div class="text-center">
                            {getImageBlobToGenerate()!.name}
                          </div>
                        </Show>
                      </div>
                      <div class="flex items-center justify-center gap-3">
                        <div>
                          <button
                            onClick={() => {
                              setCapture('camera')
                              imageInput.click()
                            }}
                            class="filled-tonal-button"
                          >
                            カメラを開く
                          </button>
                        </div>
                        <div>
                          または
                          <button
                            onClick={() => {
                              setCapture(void 0)
                              imageInput.click()
                            }}
                            class="text-button"
                          >
                            写真を選択
                          </button>
                        </div>
                      </div>
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        capture={getCapture()}
                        ref={imageInput}
                        onChange={(e) => {
                          const file = e.target?.files?.[0]
                          if (file) {
                            setImageBlobToGenarate(() => file)
                          }
                        }}
                      />
                      <hr class="my-2" />
                    </div>
                  )
                })()}
              </Show>
              <label>
                <div class="text-center text-lg">
                  <Show
                    when={getGenerateMode() === 'text'}
                    fallback="どのようにスキャンするかの指示を入力:"
                  >
                    AIへのプロンプトを入力:
                  </Show>
                </div>
                <textarea
                  ref={llmTextArea}
                  placeholder={
                    getGenerateMode() === 'text'
                      ? '水の電気分解について、小学生でもわかるように説明して...'
                      : '赤い文字で書かれているところを重要語句として隠して...'
                  }
                  oninput={(evt) => {
                    setPrompt(evt.currentTarget.value)
                  }}
                  onKeyDown={(evt) => {
                    if (evt.key === 'Enter' && evt.shiftKey) {
                      evt.preventDefault()
                      close(true)
                    }
                  }}
                  class="border rounded-lg w-full p-1 border-outlined bg-surface"
                ></textarea>
              </label>
            </div>
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
      >
        <div
          innerHTML={DOMPurify.sanitize(props.noteData.canToJsonData.html)}
          onClick={() => {
            props.focus()
          }}
          class="min-h-5"
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
              'px',
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
                >
                  <div innerHTML={removeIconSize(data.icon)} class="w-8 h-8" />
                </button>
              )}
            </For>
            <button class="grid drop-shadow-none" onClick={openGenerateDialog}>
              <div innerHTML={removeIconSize(IconSparkles)} class="w-8 h-8" />
            </button>
          </div>
          <div />
        </div>
      </Show>
    </div>
  )
}) satisfies NoteComponent
