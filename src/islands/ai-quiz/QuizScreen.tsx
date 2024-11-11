import {
  createEffect,
  createMemo,
  createSignal,
  For,
  onMount,
  Show,
} from 'solid-js'
import { QuizManager, type GeneratedQuiz } from './quiz-manager'
import type { MargedNoteData } from '../note/components/notes-utils'
import { QuizDB, type Quizzes } from './storage'
import type { QuizContent } from './constants'
import { shuffle } from '../../utils/arr'
import { icon } from '../../utils/icons'

const QuizSelection = (props: {
  text: string

  onChange: (selected: boolean) => void
}) => {
  const [getSelected, setSelected] = createSignal(false)

  createEffect(() => {
    props.onChange(getSelected())
  })
  return (
    <div class="w-full">
      <button
        type="button"
        class="w-full block transition-all"
        classList={{
          'filled-button': getSelected(),
          'outlined-button': !getSelected(),
        }}
        onClick={() => setSelected(!getSelected())}
      >
        {props.text}
      </button>
    </div>
  )
}

const SelectAnswerScreen = (props: {
  quiz: GeneratedQuiz
  onAnswer(selected: string[]): void
}) => {
  const [getSelected, setSelected] = createSignal<string[]>([])
  const getSelections = createMemo(() => {
    const allSelections = [
      ...props.quiz.content.corrects,
      ...props.quiz.content.damys,
    ]
    return shuffle(allSelections)
  })

  return (
    <div class="h-full grid place-items-center">
      <div class="text-lg p-2">
        <div>{props.quiz.content.question}</div>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <For each={getSelections()}>
          {(selection) => (
            <QuizSelection
              text={selection}
              onChange={(v) => {
                setSelected((prev) => {
                  const set = new Set(prev)
                  if (v) {
                    set.add(selection)
                  } else {
                    set.delete(selection)
                  }
                  return [...set]
                })
              }}
            />
          )}
        </For>
      </div>
      <div>
        <button
          class="filled-button disabled:opacity-80"
          type="button"
          onClick={() => props.onAnswer(getSelected())}
          disabled={getSelected().length === 0}
        >
          {getSelected().length === 0 ? '選択してください' : '回答する'}
        </button>
      </div>
    </div>
  )
}

const CorrectShow = (props: {
  onEndShow(): void
}) => {
  const [getIsOpacity0, setIsOpacity0] = createSignal(false)
  onMount(() => {
    setTimeout(() => {
      setIsOpacity0(true)
      setTimeout(() => {
        props.onEndShow()
      }, 200)
    }, 700)
  })
  return (
    <div class="fixed top-0 left-0 w-full h-dvh grid place-items-center">
      <div
        class="text-3xl p-2 transition-opacity"
        classList={{
          'opacity-0': getIsOpacity0(),
        }}
      >
        ✅正解!
      </div>
    </div>
  )
}

/** 不正解時 */
const ExplainScreen = (props: {
  quiz: GeneratedQuiz
  selected: string[]

  onEnd(): void
}) => {
  return (
    <div class="h-full flex flex-col justify-between p-2">
      <div class="text-3xl text-center my-2">😒不正解..</div>
      <div class="text-center p-2">{props.quiz.content.question}</div>
      <div class="grid place-items-center">
        <div class="grid grid-cols-3 gap-2">
          <div>選択肢</div>
          <div>あなたの回答</div>
          <div>正解</div>
          <For
            each={[...props.quiz.content.corrects, ...props.quiz.content.damys]}
          >
            {(selection) => (
              <>
                <div
                  classList={{
                    'text-green-500':
                      props.selected.includes(selection) ===
                      props.quiz.content.corrects.includes(selection),
                    'text-red-500':
                      props.selected.includes(selection) !==
                      props.quiz.content.corrects.includes(selection),
                  }}
                >
                  {selection}
                </div>
                <Show
                  when={props.selected.includes(selection)}
                  fallback={<div>✖</div>}
                >
                  <div>✅</div>
                </Show>
                <Show
                  when={props.quiz.content.corrects.includes(selection)}
                  fallback={<div>✖</div>}
                >
                  <div>✅</div>
                </Show>
              </>
            )}
          </For>
        </div>
      </div>
      <div class="grid place-items-center">
        <button class="flex items-center filled-button" type="button" onClick={() => props.onEnd()}>
          次の問題
          <div innerHTML={icon('chevronRight')} class="w-8 h-8" />
        </button>
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
  const [getIsShownCorrect, setIsShownCorrect] = createSignal(false)
  const [getIsShownExplain, setIsShownExplain] = createSignal(false)
  const [getSelected, setSelected] = createSignal<string[]>([])
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

  const answered = (selected: string[]) => {
    const selectedSet = new Set(selected)
    const correctIndexiesSet = new Set(currentQuiz()!.content.corrects)

    const isCorrect =
      selectedSet.isSubsetOf(correctIndexiesSet) &&
      selectedSet.isSupersetOf(correctIndexiesSet)

    setSelected(selected)

    if (isCorrect) {
      setIsShownCorrect(true)
    } else {
      setIsShownExplain(true)
    }
  }

  const nextQuiz = () => {
    setQuizIndex(p => p + 1)
    setSelected([])
    setIsShownExplain(false)
    setIsShownCorrect(false)
  }

  return (
    <div class="h-full">
      <Show
        when={currentQuiz()}
        fallback={<div class="h-full grid place-items-center">生成中...</div>}
      >
        {(quiz) => (
          <Show
            when={getIsShownExplain()}
            fallback={
              <SelectAnswerScreen quiz={quiz()} onAnswer={(s) => answered(s)} />
            }
          >
            <ExplainScreen quiz={currentQuiz()!} selected={getSelected()} onEnd={() => nextQuiz()} />
          </Show>
        )}
      </Show>
      <Show when={getIsShownCorrect()}>
        <CorrectShow onEndShow={() => {
          setIsShownCorrect(false)
          nextQuiz()
        }} />
      </Show>
    </div>
  )
}
