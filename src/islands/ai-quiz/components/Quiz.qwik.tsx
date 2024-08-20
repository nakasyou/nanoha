/** @jsxImportSource @builder.io/qwik */
import {
  $,
  component$,
  useComputed$,
  useContext,
  useContextProvider,
  useSignal,
  useStore,
  useStylesScoped$,
  useVisibleTask$,
} from '@builder.io/qwik'
import {
  QUIZ_STATE_CTX,
  SCREEN_STATE_CTX,
  SETTINGS_CTX,
  type Quiz,
  type QuizFrom,
  type QuizState,
} from '../store'
import { shuffle } from '../../../utils/arr'
import { Incorrect } from './Incorrect.qwik'
import { FinishedScreen } from './Finished.qwik'
import { getGoogleGenerativeAI } from '../../shared/gemini'
import {
  CONTENT_SCHEMA,
  PROMPT_TO_GENERATE_SELECT_QUIZ,
  type QuizContent,
} from '../constants'
import { safeParse } from 'valibot'
import { Loading } from './Utils.qwik'
import { QuizDB } from '../storage'
import { quizzesGenerator } from '../utils/generate-quizzes'

export const QuizScreen = component$(() => {
  const quizState = useStore<QuizState>(
    {
      correctQuizzes: [],
      incorrectQuizzes: [],

      quizzes: [],
      current: null,

      isFinished: false,

      generatedQuizzes: 0,

      finishedQuizIndexes: new Set(),

      lastMissedQuizzes: 0,
    },
    {
      deep: false,
    },
  )
  useContextProvider(QUIZ_STATE_CTX, quizState)
  const screenState = useContext(SCREEN_STATE_CTX)
  const settings = useContext(SETTINGS_CTX)

  const isShownCorrectDialog = useSignal(false)
  const isShownIncorrectScreen = useSignal<
    | false
    | {
        incorrectAnswer: string
      }
  >(false)

  const allQuizzes = useComputed$(() => {
    return quizState.lastMissedQuizzes + quizState.generatedQuizzes
  })

  const setQuiz = $(() => {
    const arailableQuizIndexes = quizState.quizzes
      .map((_quiz, index) => {
        if (quizState.finishedQuizIndexes.has(index)) {
          return null
        }
        return index
      })
      .filter((e) => e !== null)
    const nextQuizIndex =
      arailableQuizIndexes[
        Math.floor(Math.random() * arailableQuizIndexes.length)
      ]!
    const nextQuiz = quizState.quizzes[nextQuizIndex]
    if (!nextQuiz) {
      return
    }
    quizState.current = {
      quiz: nextQuiz.quiz,
      choices: shuffle([
        ...nextQuiz.quiz.content.damyAnswers,
        nextQuiz.quiz.content.correctAnswer,
      ]),
      index: (quizState.current?.index ?? -1) + 1,
      from: nextQuiz.from,
    }
    const nextQuizzes = [...quizState.quizzes]
    nextQuizzes.splice(nextQuizIndex, 1)
    quizState.quizzes = nextQuizzes
  })
  useVisibleTask$(async ({ track }) => {
    track(() => quizState.isFinished)

    const quizDB = new QuizDB()

    const notes =
      typeof screenState.note === 'string' ? [] : screenState.note?.notes!

    const missedQuizzes: typeof quizState.quizzes = await Promise.all(
      screenState.lastMissedQuizIds.map((id) =>
        quizDB.quizzesByNote.get(id).then(
          (q) =>
            ({
              quiz: {
                id,
                content: q!.quiz,
                source: notes.find((note) => note.id === q!.noteId)!,
              },
              from: 'missed',
            }) as const,
        ),
      ),
    )

    quizState.lastMissedQuizzes = screenState.lastMissedQuizIds.length

    // Low Correct Rate
    const targetNotebook =
      screenState.noteLoadType.from === 'local'
        ? `local-${screenState.noteLoadType.id}`
        : ''
    const howManyUseLowCorrectRate = Math.max(
      settings.quizzesByRound - missedQuizzes.length,
      5,
    )
    const lowRateQuizzes = await quizDB.quizzesByNote
      .where('targetNotebook')
      .equals(targetNotebook)
      .sortBy('rate')
    const deletePromises: Promise<void>[] = []

    quizState.quizzes = [
      ...missedQuizzes,
      ...lowRateQuizzes
        // Check timestamp as same
        .filter((q) => {
          if (!screenState.rangeNotes.has(q.noteId)) {
            return false
          }
          if (
            notes.find((note) => note.id === q.noteId)!.timestamp ===
            q.noteTimestamp
          ) {
            return true
          }
          deletePromises.push(quizDB.quizzesByNote.delete(q.id!))
          return false
        })
        .slice(0, howManyUseLowCorrectRate)
        .map(
          (q) =>
            ({
              quiz: {
                id: q.id!,
                content: q!.quiz,
                source: notes.find((note) => note.id === q!.noteId)!,
              },
              from: 'lowRate' satisfies QuizFrom,
            }) as const,
        ),
    ]

    isShownIncorrectScreen.value = false

    // Generate Quizzes
    if (
      screenState.note === 'pending' ||
      screenState.note === 'notfound' ||
      screenState.note === 'invalid'
    ) {
      return
    }
    const generateQuizzes = quizzesGenerator()
    if (!generateQuizzes) {
      return alert('AIエラー')
    }

    const sourceNotes = screenState.note!.notes.filter(
      (note) => note.type === 'text',
    )

    let generatedQuizzes = 0
    while (true) {
      if (
        generatedQuizzes + quizState.lastMissedQuizzes >
        settings.quizzesByRound
      ) {
        break
      }
      const randomNote =
        sourceNotes[Math.floor(Math.random() * sourceNotes.length)]!

      const quizzes = await Promise.all(
        (await generateQuizzes(randomNote)).map(
          async (content): Promise<Quiz> => {
            const res = await quizDB.quizzesByNote.add({
              noteId: randomNote.id,
              quiz: {
                type: 'select',
                ...content,
              },
              rate: 0,
              rateSource: {
                correct: 0,
                total: 0,
              },
              targetNotebook:
                screenState.noteLoadType.from === 'local'
                  ? `local-${screenState.noteLoadType.id}`
                  : 'unknown',
              noteTimestamp: randomNote.timestamp,
            })
            return {
              content: content,
              source: randomNote,
              id: res,
            }
          },
        ),
      )
      const addingQuizzes: typeof quizState.quizzes = []
      for (const quiz of quizzes) {
        generatedQuizzes += 1
        if (
          generatedQuizzes + quizState.lastMissedQuizzes >
          settings.quizzesByRound
        ) {
          break
        }
        addingQuizzes.push({ quiz, from: 'generated' })
      }
      quizState.quizzes = [...quizState.quizzes, ...addingQuizzes]
      quizState.generatedQuizzes = generatedQuizzes
    }
  })

  useVisibleTask$(({ track }) => {
    track(() => quizState.current)
    track(() => quizState.quizzes)
    if (!quizState.current && quizState.quizzes[0]) {
      setQuiz()
    }
  })

  useStylesScoped$(`
    .correctDialog {
      animation: correctDialogAnimation 0.7s ease-in-out forwards;
    }
    @keyframes correctDialogAnimation {
      0% {
        opacity: 1;
      }
      50% {
        opacity: 1;
      }
      100% {
        opacity: 0;
      }
    }
  `)

  /**
   * 次の問題
   */
  const next = $(() => {
    if (settings.quizzesByRound === (quizState.current?.index ?? 0) + 1) {
      quizState.isFinished = true
      return
    }
    isShownIncorrectScreen.value = false
    setQuiz()
  })

  const handleCorrect = $(() => {
    isShownCorrectDialog.value = true
    quizState.correctQuizzes = [
      ...quizState.correctQuizzes,
      quizState.current!.quiz,
    ]
    setTimeout(() => {
      next()
    }, 500)
    setTimeout(() => {
      isShownCorrectDialog.value = false
    }, 800)
  })
  const handleInorrect = $((incorrectAnswer: string) => {
    quizState.incorrectQuizzes = [
      ...quizState.incorrectQuizzes,
      quizState.current!.quiz,
    ]
    isShownIncorrectScreen.value = {
      incorrectAnswer,
    }
  })

  return (
    <>
      {
        // 正解メッセージ
        isShownCorrectDialog.value && (
          <div class="fixed w-full h-dvh grid place-items-center left-0 top-0 z-50">
            <div class="text-green-400 text-5xl font-bold correctDialog">
              😊正解!!
            </div>
          </div>
        )
      }
      {quizState.isFinished ? (
        <FinishedScreen />
      ) : quizState.current ? (
        <>
          {isShownIncorrectScreen.value ? (
            <Incorrect
              onEnd$={() => next()}
              incorrectAnswer={isShownIncorrectScreen.value.incorrectAnswer}
            />
          ) : (
            <div class="h-full flex flex-col">
              <div>
                問<span>{quizState.current.index + 1}</span>/
                <span>{settings.quizzesByRound}</span>
              </div>
              <div class="text-2xl text-center">
                {quizState.current.quiz.content.question}
              </div>
              <hr class="my-2" />
              <div class="text-base text-on-surface-variant text-right">
                {quizState.current.from === 'generated'
                  ? '⚡新しい問題'
                  : quizState.current.from === 'missed'
                    ? '📝再チャレンジ'
                    : '😒低正答率'}
              </div>
              <div class="grow grid items-center">
                <div class="flex flex-col gap-2 justify-around grow">
                  {quizState.current.choices.map((answer, idx) => (
                    <button
                      type="button"
                      key={idx}
                      class="block filled-button text-xl"
                      onClick$={() => {
                        if (
                          answer ===
                          quizState.current?.quiz.content.correctAnswer
                        ) {
                          handleCorrect()
                        } else {
                          handleInorrect(answer)
                        }
                      }}
                    >
                      {answer}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div class="text-center text-3xl">
          生成中
          <Loading />
        </div>
      )}
    </>
  )
})
