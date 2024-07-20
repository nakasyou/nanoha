/** @jsxImportSource @builder.io/qwik */

import {
  component$,
  useComputed$,
  useContext,
} from '@builder.io/qwik'
import { QUIZ_STATE_CTX, type QuizState } from '../store'

export const FinishedScreen = component$(() => {
  const quizState = useContext(QUIZ_STATE_CTX)

  const result = useComputed$(() => {
    return {
      all: quizState.goalQuestions,
      correct: quizState.correctQuizzes.length,
      incorrect: quizState.incorrectQuizzes.length,

      isAllCorrect: quizState.incorrectQuizzes.length === 0,
    }
  })

  return (
    <div>
      <div class="text-3xl text-center font-bold">Finished!</div>
      {result.value.isAllCorrect && (
        <div class="text-center text-xl">全問正解!</div>
      )}
      <div class="flex justify-center items-center gap-2">
        <div class="grid grid-cols-3 text-lg gap-1 place-items-center">
          <div>✅正解</div>
          <div class="font-bold font-mono">{result.value.correct}</div>
          <div class="row-span-2">
            <div class="text-center text-3xl">
              / <span class="font-bold font-mon">{result.value.all}</span>
            </div>
          </div>
          <div>✖不正解</div>
          <div class="font-bold font-mono">{result.value.incorrect}</div>
        </div>
      </div>
      <div class="flex flex-col gap-2">
        <button
          onClick$={() => {
            quizState.quizzes = quizState.incorrectQuizzes
            quizState.goalQuestions = quizState.incorrectQuizzes.length
            quizState.generatedQuizzes = quizState.incorrectQuizzes.length

            quizState.correctQuizzes = []
            quizState.incorrectQuizzes = []

            quizState.current = null
            quizState.isFinished = false
          }}
          class="filled-button disabled:opacity-30"
          disabled={result.value.isAllCorrect}
          type="button"
        >
          間違えた問題をやり直す
        </button>
        <button
          onClick$={() => {
            quizState.quizzes = []
            quizState.goalQuestions = 5
            quizState.correctQuizzes = []
            quizState.incorrectQuizzes = []
            quizState.current = null
            quizState.isFinished = false
            quizState.generatedQuizzes = 0
          }}
          class="filled-button"
          type="button"
        >
          もう一度行う
        </button>
      </div>
    </div>
  )
})
