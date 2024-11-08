import { createEffect, createSignal, onCleanup, onMount, Show } from "solid-js"
import { getGoogleGenerativeAI } from "../../../../shared/gemini"
import type { GenerateContentStreamResult, GoogleGenerativeAI } from "@google/generative-ai"
import markdownIt from "markdown-it"

const markdownParser = markdownIt()

type Mode = 'text' | 'image'

const renderMarkdown = (markdown: string) =>       markdownParser.render(markdown.replace(/\*\*[\s\S]*?\*\*/g,(str) => `((${str.slice(2, -2)}))`,),).replace(/\(\([\s\S]*?\)\)/g,(str) => `<span data-nanohasheet="true" class="nanoha-sheet">${str.slice(2, -2)}</span>`,)

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
        テキストから生成
      </button>
      <button
        class="border-b w-full"
        onClick={() => props.onChange('image')}
        type="button"
      >
        写真をスキャンして生成
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
  '英語の曜日についての暗記シート'
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
}) => {
  const [getCurrentPlaceholder, setCurrentPlaceholder] = createSignal({
    isWriting: false,
    current: '',
    index: 0,
  })
  const [getPrompt, setPrompt] = createSignal('')

  let cleanupped = false
  onMount(() => {
    const step = async () => {
      const currentPlaceholder = getCurrentPlaceholder()
      const placeholderTarget = FROM_TEXT_PLACEHOLDER_CONTENTS[currentPlaceholder.index] ?? ''

      if (currentPlaceholder.isWriting) {
        // 追加中
        if (currentPlaceholder.current === placeholderTarget) {
          // 書き終わった
          await new Promise(resolve => setTimeout(resolve, 1500))
          setCurrentPlaceholder({
            ...currentPlaceholder,
            isWriting: false, // 削除している
          })
        } else {
          // 書き続ける
          setCurrentPlaceholder({
            ...currentPlaceholder,
            current: currentPlaceholder.current + placeholderTarget[currentPlaceholder.current.length],
          })
        }
      } else {
        // Backspace している
        if (currentPlaceholder.current === '') {
          // 次
          setCurrentPlaceholder({
            current: '',
            isWriting: true,
            index: (currentPlaceholder.index + 1) % FROM_TEXT_PLACEHOLDER_CONTENTS.length,
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
      model: 'gemini-1.5-flash'
    })
    props.setStream(await model.startChat({
      systemInstruction: {
        role: 'model',
        parts: [
          {
            text: 'ユーザーの指示に基づき、暗記の手助けになる赤シート用文章を生成しなさい。赤シートで隠すべき単語は、Markdownの太字機能で表現しなさい。隠す必要がない場所には太字は使わないでください。太字の場所はユーザーに見えません。また、単語の一覧を箇条書きにすることはしないでください。',
          }
        ]
      }
    }).sendMessageStream(getPrompt()))
  }

  return <div>
    <div>
      <label>
        <div>プロンプトを入力...</div>
        <textarea placeholder={getCurrentPlaceholder().current} class="w-full p-1 h-20" value={getPrompt()} onInput={e => setPrompt(e.target.value)} />
      </label>
      <button onClick={generate} class="filled-button my-2 disabled:opacity-70" disabled={!getPrompt()}>生成</button>
    </div>
  </div>
}
export const FromImage = (props: {
  setStream(stream: GenerateContentStreamResult): void
}) => {
  return <div>
    <input ref={inputRef} type="file"></input>
  </div>
}
export const AIDialogCore = (props: {
  close(result: string): void
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
  return <div>
    <Show when={getStream()} fallback={
      <>
        <ModeSwitcher mode={getGenerateMode()} onChange={setGenerateMode} />
        <Show when={getGenerateMode() === 'text'}>
          <FromText setStream={setStream} />
        </Show>
      </>
    }>
      <div>
        <Show when={getIsGenerating()}><div class="text-2xl">生成中...</div></Show>
        <div class="nanohanote-textnote-styler border p-1" innerHTML={renderMarkdown(getGenerated())} />
        <button onClick={() => props.close(renderMarkdown(getGenerated()))} class="filled-button disabled:opacity-80" disabled={getIsGenerating()}>結果を挿入する</button>
      </div>
    </Show>
  </div>
  /*return (
    <div>
      <Show when={getGenerateMode() === 'image'}>
        {(() => {
          let imageInput!: HTMLInputElement
          const [getCapture, setCapture] = createSignal<string | undefined>(
            void 0,
          )
          return (
            <div>
              <div class="text-xl text-center">画像を選択:</div>
              <div class="p-2">
                <Show when={getImageBlobToGenerate()}>
                  <div class="grid place-items-center">
                    <img
                      class="max-h-[30dvh] max-w-full"
                      src={URL.createObjectURL(getImageBlobToGenerate()!)}
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
                    type="button"
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
                    type="button"
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
        />
      </label>
    </div>
  )*/
}
