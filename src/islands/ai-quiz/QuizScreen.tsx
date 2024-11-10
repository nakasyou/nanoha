import { createEffect, createMemo, createSignal, For, onMount, Show } from 'solid-js'
import { QuizManager, type GeneratedQuiz } from './quiz-manager'
import type { MargedNoteData } from '../note/components/notes-utils'
import { QuizDB, type Quizzes } from './storage'
import type { QuizContent } from './constants'
import { shuffle } from '../../utils/arr'

const QuizSelection = (props: {
  text: string

  onChange: (selected: boolean) => void
}) => {
  const [getSelected, setSelected] = createSignal(false)

  createEffect(() => {
    props.onChange(getSelected())
  })
  return (
    <div>
      <button type="button" class="filled-button transition-transform" classList={{
        'scale-90': getSelected(),
      }} onClick={() => setSelected(!getSelected())}>
        {props.text}
      </button>
    </div>
  )
}

const SelectAnswerScreen = (props: {
  quiz: QuizContent
}) => {
  const getSelections = createMemo(() => {
    const allSelections = [...props.quiz.corrects, ...props.quiz.damys]
    return shuffle(allSelections)
  })
  return (
    <div class="h-full grid place-items-center">
      <div class='flex flex-col gap-2 items-center'>
        <For each={getSelections()}>
          {(selection) => <QuizSelection text={selection} onChange={() => {}} />}
        </For>
      </div>
    </div>
  )
}

export const QuizScreen = (props: {
  notes: MargedNoteData[]
  noteId: number
}) => {
  const [getQuizzes, setQuizzes] = createSignal<GeneratedQuiz[]>([])
  const [getQuizIndex, setQuizIndex] = createSignal(0)
  const currentQuiz = createMemo(() => getQuizzes()[getQuizIndex()])

  onMount(async () => {
    // Init
    const db = new QuizDB()
    const quizManager = new QuizManager(db)

    // Generate
    const generated = await quizManager.generateQuizzes(
      5,
      props.notes,
      props.noteId,
    )
    setQuizzes(generated)
  })

  return (
    <div class="h-full">
      <Show
        when={currentQuiz()}
        fallback={<div class="h-full grid place-items-center">生成中...</div>}
      >
        {quiz => <SelectAnswerScreen quiz={quiz().content} />}
      </Show>
    </div>
  )
}
