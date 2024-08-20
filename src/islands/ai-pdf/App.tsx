import { createSignal, onMount, Show } from 'solid-js'
import { QuizzesGenerator } from '../ai-quiz/utils/generate-quizzes'
import type { NoteLoadType } from '../note/note-load-types'

export const Cotroller = (props: {
  onGenerateTest: (init: {
    quizzesCount: number
  }) => void
  disabled: boolean
}) => {
  const [getQuizzesCount, setQuizzesCount] = createSignal(5)

  return (
    <div>
      <div class="text-3xl text-center font-bold">Generate Test with AI</div>
      <div class="w-full flex flex-col gap-2 items-center m-2">
        <div>
          <label>
            問題数:
            <input
              class="disabled:opacity-30 border p-1 m-1 border-outline rounded-full text-center"
              type="number"
              min={1}
              max={100}
              value={getQuizzesCount()}
              onInput={(e) => setQuizzesCount(+e.currentTarget.value)}
              disabled={props.disabled}
            />
          </label>
        </div>
      </div>
      <div class="grid place-items-center">
        <button type="button" class="filled-button text-center disabled:opacity-30" onClick={() => {
          props.onGenerateTest({ quizzesCount: getQuizzesCount() })
        }} aria-disabled={props.disabled} disabled={props.disabled}>
          テストを生成する
        </button>
      </div>
    </div>
  )
}

type TestQuizContent = {
  type: 'select'
  question: string
  explanation: string
  correctAnswer: string
  damyAnswers: string[]
}

export const App = (props: {
  noteLoadType: NoteLoadType
}) => {
  const [getIsGenerating, setIsGenerating] = createSignal(false)

  onMount(async () => {
    // Load notebook
    
  })
  return <div class="p-2">
    <div>
      <Cotroller onGenerateTest={async (init) => {
        setIsGenerating(true)

        new QuizzesGenerator()
      }} disabled={getIsGenerating()} />
    </div>
    <div class='text-center'>
      <Show when={getIsGenerating()}>
        <div>AI によるテストを生成中...</div>
      </Show>
    </div>
  </div>
}
