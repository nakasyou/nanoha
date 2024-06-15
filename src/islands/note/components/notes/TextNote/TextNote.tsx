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
  onCleanup
} from 'solid-js'
import { removeIconSize } from '../../../utils/icon/removeIconSize'

import IconNote from '@tabler/icons/outline/note.svg?raw'
import IconBold from '@tabler/icons/outline/bold.svg?raw'
import IconUnderline from '@tabler/icons/outline/underline.svg?raw'
import IconSparkles from '@tabler/icons/outline/sparkles.svg?raw'
import IconCamera from '@tabler/icons/outline/camera.svg?raw'

import { Editor, } from '@tiptap/core'
import { Dialog } from '../../utils/Dialog'
import { Controller } from '../../note-components/Controller'
import { noteBookState } from '../../../store'
import { Player } from './Player'

import './TextNoteStyle.css'
import type { SetStoreFunction } from 'solid-js/store'
import { getVisualViewport } from '../../../window-apis'
import { generateWithLLM } from '../../../../shared/ai'
import { getGoogleGenerativeAI } from '../../../../shared/gemini'
import markdownIt from 'markdown-it'

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
  const [isShowCloseDialog, setIsShowCloseDialog] = createSignal(false)
  const [getIsShowLlmPromptDialog, setIsShowLlmPromptDialog] = createSignal(false)
  const [getPrompt, setPrompt] = createSignal('')
  const [getIsShownFromImageDialog, setIsShownFromImageDialog] = createSignal(false)
  const [getImageBlobToGenerate, setImageBlobToGenarate] = createSignal<Blob>()

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
    //editor.chain().insertContent(``).focus().run()
    const ai = getGoogleGenerativeAI()
    if (!ai) {
      if (confirm('AI 機能が設定されていません。\n設定を開きますか？')) {
        location.href = '/app/settings#ai'
      }
      return
    }
    const model = ai.getGenerativeModel({
      model: 'gemini-1.5-flash'
    })
    const stream = await model.startChat({
      systemInstruction: {
        role: 'model',
        parts: [{
          text: `ユーザーの指示に基づき、暗記の手助けになる赤シート用文章を生成しなさい。赤シートで隠すべき単語は、Markdownの太字機能で表現しなさい。隠す必要がない場所には太字は使わないでください。`
        }]
    }
    }).sendMessageStream(prompt)
    insertFromStream((async function*() {
      for await (const chunk of stream.stream) {
        yield chunk.text()
      }
    })())
  }
  const insertFromStream = async (stream: AsyncGenerator<string, void, unknown>) => {
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
      editor.commands.insertContent(text)
      //pre.content = rawText//markdownParser.render(rawText)
    }
    editor.commands.deleteNode(pre.node.type)
    //pre.content = ''
    editor.commands.insertContent(
      markdownParser.render(
        rawText.replace(/\*\*[\s\S]*?\*\*/g, str => `((${str.slice(2, -2)}))`)
      ).replace(/\(\([\s\S]*?\)\)/g, str => `<span data-nanohasheet="true">${str.slice(2, -2)}</span>`)
    )
    saveContent()
  }
  const openGenerateDialog = () => {
    const editor = getEditor()
    if (!editor) {
      return
    }
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
        }} type='confirm' title='Generate with AI' okLabel='生成'>{close => (<div>
          <label>
            <div>AIに入力するプロンプトを入力:</div>
            <textarea ref={llmTextArea} placeholder='水の電気分解について、小学生でもわかるように説明して...' oninput={(evt) => {
              setPrompt(evt.currentTarget.value)
            }} onKeyDown={(evt) => {
              if (evt.key === 'Enter' && evt.shiftKey) {
                evt.preventDefault()
                close(true)
              }
            }} class='border rounded-lg w-full p-1 border-outlined bg-surface'></textarea>
          </label>
        </div>)}</Dialog>
      </Show>

      <Show when={getIsShownFromImageDialog()}>
        <Dialog onClose={async (result) => {
          setIsShownFromImageDialog(false)
          if (result) {
            const file = getImageBlobToGenerate()!
            const stream = generateWithLLM([
              `画像の文章をそのまま、Markdownとして書き出しなさい。書き出す上で、重要な単語は、太字で表現しなさい。`,
              file
            ], 'gemini-pro-vision')
                if (!stream) {
                  if (confirm('AI 機能が設定されていません。\n設定を開きますか？')) {
                    location.href = '/app/settings#ai'
                  }
                  return
                }
            await insertFromStream(stream)
          }
        }} type='confirm' title='画像から生成 with AI' okLabel='生成'>{close => {
          let imageInput!: HTMLInputElement
          const [getImageUrl, setImageUrl] = createSignal<string>()
          return <>
            <Show when={getImageUrl()}>
              <img src={getImageUrl()} alt="Preview Image" class="w-full h-64 object-contain" />
            </Show>
            <div class='flex justify-center flex-wrap gap-2 p-2'>
              <button onClick={() => {
                imageInput.capture = 'camera'
                imageInput.click()
              }} class='filled-tonal-button'>カメラを開く</button>
              <span>
                または
                <button onClick={() => {
                  imageInput.capture = ''
                  imageInput.click()
                }} class='text-button'>ファイルを開く</button>
              </span>
            </div>
            <input onInput={() => {
              const file = imageInput.files?.[0]
              if (!file) {
                return
              }
              setImageBlobToGenarate(() => file)
              setImageUrl(URL.createObjectURL(file))
            }} type="file" accept="image/*" capture="camera" hidden ref={imageInput} /> 
          </>
        }}</Dialog>
      </Show>

      <Show when={!noteBookState.isEditMode}>
        <Player html={getEditor()?.getHTML() || props.noteData.canToJsonData.html} />
      </Show>

      <div
        classList={{
          hidden: !getIsActive() || !noteBookState.isEditMode
        }}
      >
        <div class="textnote-tiptap-container rounded my-2 border boader-outlined nanohanote-textnote-styler break-words">
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
              onClick={openGenerateDialog}
            >
              <div innerHTML={removeIconSize(IconSparkles)} class="w-8 h-8" />
            </button>
            <button
              class="grid drop-shadow-none"
              onClick={() => setIsShownFromImageDialog(true)}
            >
              <div innerHTML={removeIconSize(IconCamera)} class="w-8 h-8" />
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
