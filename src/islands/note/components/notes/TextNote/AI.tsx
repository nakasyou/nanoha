import type {
  GenerateContentStreamResult,
  GoogleGenerativeAI,
} from '@google/generative-ai'
import markdownIt from 'markdown-it'
import {
  Show,
  createComputed,
  createEffect,
  createMemo,
  createResource,
  createSignal,
  onCleanup,
  onMount,
  untrack,
} from 'solid-js'
import { getGoogleGenerativeAI } from '../../../../shared/gemini'

const markdownParser = markdownIt()

type Mode = 'text' | 'image'

const renderMarkdown = (markdown: string) =>
  markdownParser
    .render(
      markdown.replace(/\*\*[\s\S]*?\*\*/g, (str) => `((${str.slice(2, -2)}))`),
    )
    .replace(
      /\(\([\s\S]*?\)\)/g,
      (str) =>
        `<span data-nanohasheet="true" class="nanoha-sheet">${str.slice(2, -2)}</span>`,
    )

const ModeSwitcher = (props: {
  mode: Mode
  onChange(mode: Mode): void
}) => {
  return (
    <div class="grid grid-cols-2 place-items-center">
      <button
        class="border-b w-full"
        onClick={() => props.onChange('text')}
        type="button"
      >
        テキストから
        <wbr />
        生成
      </button>
      <button
        class="border-b w-full"
        onClick={() => props.onChange('image')}
        type="button"
      >
        写真を
        <wbr />
        スキャンして生成
      </button>
      <div
        class="border-t border-primary w-full transition-transform duration-200 ease-in -translate-y-px"
        classList={{
          'translate-x-full': props.mode === 'image',
        }}
      />
    </div>
  )
}

const FROM_TEXT_PLACEHOLDER_CONTENTS: string[] = [
  '水の電気分解とは?',
  '平安時代の貴族について',
  '日本国憲法について説明して',
  '日本語の品詞についての暗記シートを作成して',
  '英語の曜日についての暗記シート',
]

const getGemini = (): GoogleGenerativeAI => {
  const ai = getGoogleGenerativeAI()
  if (!ai) {
    if (confirm('AI 機能が設定されていません。\n設定を開きますか？')) {
      location.href = '/app/settings#ai'
    }
    throw 0
  }
  return ai
}
export const FromText = (props: {
  setStream(stream: GenerateContentStreamResult): void
  initPrompt?: string
}) => {
  const [getCurrentPlaceholder, setCurrentPlaceholder] = createSignal({
    isWriting: false,
    current: '',
    index: 0,
  })
  const [getPrompt, setPrompt] = createSignal(props.initPrompt ?? '')

  let cleanupped = false
  onMount(() => {
    const step = async () => {
      const currentPlaceholder = getCurrentPlaceholder()
      const placeholderTarget =
        FROM_TEXT_PLACEHOLDER_CONTENTS[currentPlaceholder.index] ?? ''

      if (currentPlaceholder.isWriting) {
        // 追加中
        if (currentPlaceholder.current === placeholderTarget) {
          // 書き終わった
          await new Promise((resolve) => setTimeout(resolve, 1500))
          setCurrentPlaceholder({
            ...currentPlaceholder,
            isWriting: false, // 削除している
          })
        } else {
          // 書き続ける
          setCurrentPlaceholder({
            ...currentPlaceholder,
            current:
              currentPlaceholder.current +
              placeholderTarget[currentPlaceholder.current.length],
          })
        }
      } else {
        // Backspace している
        if (currentPlaceholder.current === '') {
          // 次
          setCurrentPlaceholder({
            current: '',
            isWriting: true,
            index:
              (currentPlaceholder.index + 1) %
              FROM_TEXT_PLACEHOLDER_CONTENTS.length,
          })
        } else {
          // Backspace している
          setCurrentPlaceholder({
            ...currentPlaceholder,
            current: currentPlaceholder.current.slice(0, -1),
          })
        }
      }

      if (!cleanupped) {
        requestAnimationFrame(step)
      }
    }
    step()
  })
  onCleanup(() => {
    cleanupped = true
  })

  const generate = async () => {
    const gemini = getGemini()
    const model = gemini.getGenerativeModel({
      model: 'gemini-1.5-flash',
    })
    props.setStream(
      await model
        .startChat({
          systemInstruction: {
            role: 'model',
            parts: [
              {
                text: 'ユーザーの指示に基づき、暗記の手助けになる赤シート用文章を生成しなさい。赤シートで隠すべき単語は、Markdownの太字機能で表現しなさい。隠す必要がない場所には太字は使わないでください。太字の場所はユーザーに見えません。また、単語の一覧を箇条書きにすることはしないでください。',
              },
            ],
          },
        })
        .sendMessageStream(getPrompt()),
    )
  }

  return (
    <div>
      <div>
        <label>
          <div>プロンプトを入力...</div>
          <textarea
            placeholder={getCurrentPlaceholder().current}
            class="w-full p-1 h-20"
            value={getPrompt()}
            onInput={(e) => setPrompt(e.target.value)}
          />
        </label>
        <button
          onClick={generate}
          class="filled-button my-2 disabled:opacity-70"
          disabled={!getPrompt()}
          type="button"
        >
          生成
        </button>
      </div>
    </div>
  )
}
export const FromImage = (props: {
  setStream(stream: GenerateContentStreamResult): void
}) => {
  const [getImageFile, setImageFile] = createSignal<File>()
  const [getScanedImageURL, setScanedImageURL] = createSignal<string>()

  createEffect(() => {
    untrack(() => {
      const prev = getScanedImageURL()
      if (prev) {
        URL.revokeObjectURL(prev)
      }
    })
    const file = getImageFile()
    setScanedImageURL(file ? URL.createObjectURL(file) : void 0)
  })

  const generate = async () => {
    const file = getImageFile()
    if (!file) {
      return
    }

    const ai = getGemini()
    const model = ai.getGenerativeModel({
      model: 'gemini-1.5-pro',
    })
    const b64 = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]!)
      reader.readAsDataURL(file)
    })

    const stream = await model
      .startChat({
        systemInstruction: {
          role: 'model',
          parts: [
            {
              text: '画像を抽出し、そっくりそのまま書き出しなさい。省略せずに画像の文字全てを書き出すこと。画像に書いていないことは書かないこと。また、ユーザーからの指示があれば、条件を満たす場所をMarkdownの太字で表現しなさい。',
            },
          ],
        },
      })
      .sendMessageStream([
        {
          text: '',
        },
        {
          inlineData: {
            mimeType: file.type,
            data: b64,
          },
        },
      ])
    props.setStream(stream)
  }

  return (
    <div>
      <Show
        when={getImageFile()}
        fallback={
          <div>
            <FromImageScanner scaned={setImageFile} />
          </div>
        }
      >
        <div class="h-[70dvh] grid grid-cols-1 md:grid-cols-2">
          <div>
            <img
              class="max-h-full p-2"
              src={getScanedImageURL()}
              alt="Scaned"
            />
          </div>
          <div class="h-full">
            <label class="h-full flex flex-col">
              <div>どのように処理するかのカスタムプロンプト(任意)</div>
              <textarea class="w-full m-1 p-1 border grow" placeholder="" />
              <button onClick={generate} type="button" class="filled-button">
                生成
              </button>
            </label>
          </div>
        </div>
      </Show>
    </div>
  )
}
const FromImageScanner = (props: {
  scaned(file: File): void
}) => {
  let inputRef!: HTMLInputElement
  const [getIsUsingCamera, setIsUsingCamera] = createSignal(false)
  const open = (useCamera: boolean) => {
    setIsUsingCamera(useCamera)
    inputRef.click()
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        hidden
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0]
          file && props.scaned(file)
        }}
        capture={getIsUsingCamera() ? 'camera' : void 0}
      />
      <div class="flex justify-center p-2 gap-1 flex-wrap">
        <button class="filled-button" type="button" onClick={() => open(true)}>
          カメラを開く
        </button>
        <div>
          または
          <button class="text-button" type="button" onClick={() => open(false)}>
            ファイルを開く
          </button>
        </div>
      </div>
    </div>
  )
}
export const AIDialogCore = (props: {
  close(result: string): void
  initPrompt?: string
}) => {
  const [getGenerateMode, setGenerateMode] = createSignal<Mode>('text')
  const [getStream, setStream] = createSignal<GenerateContentStreamResult>()
  const [getGenerated, setGenerated] = createSignal('')
  const [getIsGenerating, setIsGenerating] = createSignal(false)

  createEffect(() => {
    const stream = getStream()
    if (!stream) {
      return
    }
    ;(async () => {
      setIsGenerating(true)
      for await (const chunk of stream.stream) {
        setGenerated(`${getGenerated()}${chunk.text()}`)
      }
      setIsGenerating(false)
    })()
  })
  return (
    <div>
      <Show
        when={getStream()}
        fallback={
          <>
            <ModeSwitcher mode={getGenerateMode()} onChange={setGenerateMode} />
            <Show
              when={getGenerateMode() === 'text'}
              fallback={<FromImage setStream={setStream} />}
            >
              <FromText setStream={setStream} initPrompt={props.initPrompt} />
            </Show>
          </>
        }
      >
        <div>
          <Show when={getIsGenerating()}>
            <div class="text-2xl">生成中...</div>
          </Show>
          <div
            class="nanohanote-textnote-styler border p-1"
            innerHTML={renderMarkdown(getGenerated())}
          />
          <button
            onClick={() => props.close(renderMarkdown(getGenerated()))}
            class="filled-button disabled:opacity-80"
            disabled={getIsGenerating()}
            type="button"
          >
            結果を挿入する
          </button>
        </div>
      </Show>
    </div>
  )
}
