/** @jsxImportSource @builder.io/qwik */

import {
  component$,
  useComputed$,
  useContext,
  useVisibleTask$,
} from '@builder.io/qwik'
import { QuizDB } from '../storage'
import { QUIZ_STATE_CTX, SCREEN_STATE_CTX } from '../store'

export const FinishedScreen = component$(() => {
  const screenState = useContext(SCREEN_STATE_CTX)
  const quizState = useContext(QUIZ_STATE_CTX)

  const result = useComputed$(() => {
    return {
      all: quizState.correctQuizzes.length + quizState.incorrectQuizzes.length,
      correct: quizState.correctQuizzes.length,
      incorrect: quizState.incorrectQuizzes.length,

      isAllCorrect: quizState.incorrectQuizzes.length === 0,
    }
  })

  useVisibleTask$(async ({ track }) => {
    track(() => quizState.incorrectQuizzes)

    const quizDB = new QuizDB()
    screenState.lastMissedQuizIds = quizState.incorrectQuizzes.map((q) => q.id)

    for (const q of quizState.incorrectQuizzes) {
      const current = await quizDB.quizzesByNote.get(q.id)
      if (!current) continue
      current.rateSource.total++
      await quizDB.quizzesByNote.update(q.id, {
        rateSource: current.rateSource,
        rate: current.rateSource.correct / current.rateSource.total,
      })
    }
    for (const q of quizState.correctQuizzes) {
      const current = await quizDB.quizzesByNote.get(q.id)
      if (!current) continue
      current.rateSource.correct++
      current.rateSource.total++
      const rate = current.rateSource.correct / current.rateSource.total
      if (rate > 0.8) {
        // もうたぶん覚えた
        await quizDB.quizzesByNote.delete(q.id)
        continue
      }
      await quizDB.quizzesByNote.update(q.id, {
        rateSource: current.rateSource,
        rate,
      })
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
            quizState.quizzes = []
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
