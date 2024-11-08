import { createSignal, onCleanup, onMount, Show } from "solid-js"

type Mode = 'text' | 'image'

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
export const FromText = () => {
  const [getCurrentPlaceholder, setCurrentPlaceholder] = createSignal({
    isWriting: false,
    current: '',
    index: 0,
  })

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

  return <div>
    <div>
      <label>
        <div>プロンプトを入力...</div>
        <textarea placeholder={getCurrentPlaceholder().current} />
      </label>
    </div>
  </div>
}

export const AIDialogCore = () => {
  const [getGenerateMode, setGenerateMode] = createSignal<Mode>('text')
  return <div>
    <ModeSwitcher mode={getGenerateMode()} onChange={setGenerateMode} />
    <Show when={getGenerateMode() === 'text'}>
      <FromText />
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
