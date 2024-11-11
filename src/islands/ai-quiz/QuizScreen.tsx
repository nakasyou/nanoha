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
    setSelected([])
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
        <Show
          when={props.quiz.reason === 'new'}
          fallback={
            <div>
              😒低正答率 (
              {Math.round(
                (props.quiz.rate.correct / props.quiz.rate.proposed) * 10000,
              ) / 100}%
              )
            </div>
          }
        >
          ⚡新しい問題
        </Show>
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
      <div>
        <div class="text-3xl text-center my-2">😒不正解..</div>
        <div class="text-center p-2">{props.quiz.content.question}</div>
      </div>
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
        <button
          class="flex items-center filled-button"
          type="button"
          onClick={() => props.onEnd()}
        >
          次の問題
          <div innerHTML={icon('chevronRight')} class="w-8 h-8" />
        </button>
      </div>
    </div>
  )
}

const ResultScreen = (props: {
  correct: number
  all: number

  onFinish(): void
  onNextRound(): void
}) => {
  const rate = createMemo(() => (props.correct / props.all) * 100)

  return (
    <div class="h-full flex flex-col justify-around items-center">
      <div>
        <div
          class="w-48 h-48 rounded-full"
          style={{
            background: `conic-gradient(rgb(16 185 129) 0%, rgb(16 185 129) ${rate()}%, rgb(239 68 68) ${rate()}%, rgb(239 68 68) 100%)`,
          }}
        />
        <div class="flex flex-wrap gap-2 justify-center">
          <div>{Math.round(rate() * 100) / 100}%</div>
          <div>
            {props.correct} / {props.all} 正解
          </div>
        </div>
      </div>
      <div class="flex">
        <button
          onClick={() => props.onNextRound()}
          type="button"
          class="filled-button flex gap-2 justify-center items-center"
        >
          次のラウンド
          <div class="w-10 h-10" innerHTML={icon('chevronRight')} />
        </button>
        <button
          onClick={() => props.onFinish()}
          type="button"
          class="text-button"
        >
          終了する
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
  const [getCorrectCount, setCorrectCount] = createSignal(0)
  const currentQuiz = createMemo(() => getQuizzes()[getQuizIndex()])

  const isFinished = createMemo(() => getQuizIndex() === 10)

  let quizManager!: QuizManager

  const nextRound = async () => {
    // Generate
    const generated = await quizManager.generateQuizzes(
      10,
      props.notes,
      props.noteId,
    )
    setQuizzes(generated)
    setQuizIndex(0)
    setIsShownCorrect(false)
    setIsShownExplain(false)
    setSelected([])
    setCorrectCount(0)
  }
  onMount(async () => {
    // Init
    const db = new QuizDB()
    quizManager = new QuizManager(db)
    await nextRound()
  })

  const answered = (selected: string[]) => {
    const selectedSet = new Set(selected)
    const correctSet = new Set(currentQuiz()!.content.corrects)

    const isCorrect =
      selectedSet.isSubsetOf(correctSet) && selectedSet.isSupersetOf(correctSet)

    setSelected(selected)

    if (isCorrect) {
      setIsShownCorrect(true)
      setCorrectCount((p) => p + 1)
    } else {
      setIsShownExplain(true)
    }
    quizManager.updateQuizStat(currentQuiz()!.id, isCorrect)
  }

  const nextQuiz = () => {
    setQuizIndex((p) => p + 1)
    setSelected([])
    setIsShownExplain(false)
    setIsShownCorrect(false)
  }

  const finish = () => {
    location.href = location.href.replace(/\/quiz\/?$/, '')
  }

  return (
    <div class="h-full">
      <Show
        when={currentQuiz()}
        fallback={
          <Show
            when={isFinished()}
            fallback={
              <div class="h-full grid place-items-center">生成中...</div>
            }
          >
            <ResultScreen
              all={10}
              correct={getCorrectCount()}
              onFinish={() => finish()}
              onNextRound={() => nextRound()}
            />
          </Show>
        }
      >
        {(quiz) => (
          <Show
            when={getIsShownExplain()}
            fallback={
              <SelectAnswerScreen quiz={quiz()} onAnswer={(s) => answered(s)} />
            }
          >
            <ExplainScreen
              quiz={currentQuiz()!}
              selected={getSelected()}
              onEnd={() => nextQuiz()}
            />
          </Show>
        )}
      </Show>
      <Show when={getIsShownCorrect()}>
        <CorrectShow
          onEndShow={() => {
            setIsShownCorrect(false)
            nextQuiz()
          }}
        />
      </Show>
    </div>
  )
}
