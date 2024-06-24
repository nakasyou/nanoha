/** @jsxImportSource @builder.io/qwik */
import { $, component$, useContext, useContextProvider, useSignal, useStore, useStylesScoped$, useVisibleTask$ } from '@builder.io/qwik'
import { QUIZ_STATE_CTX, SCREEN_STATE_CTX, type QuizState } from '../store'
import { shuffle } from '../../../utils/arr'
import { Incorrect } from './Incorrect.qwik'
import { FinishedScreen } from './Finished.qwik'

export const QuizScreen = component$(() => {
  const quizState = useStore<QuizState>({
    correctQuizzes: [],
    incorrectQuizzes: [],

    quizzes: [],
    current: null,
    goalQuestions: 5,

    isFinished: false
  }, {
    deep: false
  })
  useContextProvider(QUIZ_STATE_CTX, quizState)
  const screenState = useContext(SCREEN_STATE_CTX)

  const isShownCorrectDialog = useSignal(false)
  const isShownIncorrectScreen = useSignal<false | {
    incorrectAnswer: string
  }>(false)

  const setQuiz = $((index: number) => {
    const quiz = quizState.quizzes[index]
    if (!quiz) {
      return
    }
    quizState.current = {
      index: index,
      quiz,
      choices: shuffle([
        ...quiz.content.damyAnswers,
        quiz.content.correctAnswer
      ])
    }
  })
  useVisibleTask$(async () => {
    // Generate Quizzes
    if (screenState.note === 'pending' || screenState.note === 'notfound' || screenState.note === 'invalid') {
      return
    }
    while (true) {
      if (quizState.quizzes.length >= quizState.goalQuestions) {
        break
      }
      quizState.quizzes = [
        ...quizState.quizzes,
        {
          content: {
            question: '問題',
            correctAnswer: '答え',
            damyAnswers: ['答え1', '答え2', '答え3'],
            explanation: '解説'
          },
          source: screenState.note!.notes[0]!
        }
      ]
      if (!quizState.current && quizState.quizzes[0]) {
        setQuiz(0)
      }
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
    if (quizState.goalQuestions <= quizState.quizzes.length) {
      quizState.isFinished = true
      return
    }
    isShownIncorrectScreen.value = false
    setQuiz((quizState.current?.index ?? 0) + 1)
  })

  const handleCorrect = $(() => {
    isShownCorrectDialog.value = true
    quizState.correctQuizzes = [...quizState.correctQuizzes, quizState.current!.quiz]
    setTimeout(() => {
      next()
    }, 500)
    setTimeout(() => {
      isShownCorrectDialog.value = false
    }, 800)
  })
  const handleInorrect = $((incorrectAnswer: string) => {
    quizState.incorrectQuizzes = [...quizState.incorrectQuizzes, quizState.current!.quiz]
    isShownIncorrectScreen.value = {
      incorrectAnswer
    }
  })

  return <>
    {
      // 正解メッセージ
      isShownCorrectDialog.value && (<div class="fixed w-full h-[100dvh] grid place-items-center left-0 top-0 z-50">
        <div class="text-green-400 text-5xl font-bold correctDialog">
          😊正解!!
        </div>
      </div>)
    }
    {
      quizState.isFinished ? <FinishedScreen /> : quizState.current ? <>
        {
          isShownIncorrectScreen.value ?
            <Incorrect
              onEnd$={() => next()}
              incorrectAnswer={isShownIncorrectScreen.value.incorrectAnswer}
            /> :
            <div>
              <div>問<span>{quizState.current.index + 1}</span>/<span>{quizState.goalQuestions}</span></div>
              <div class="text-2xl text-center">{quizState.current.quiz.content.question}</div>
              <hr class="my-2" />
              <div class="text-base text-on-surface-variant text-right">✨AI Generated</div>
              <div class="grow grid items-center">
                <div class='flex flex-col gap-2 justify-around grow'>
                  {
                    quizState.current.choices.map((answer, idx) => (
                      <button
                        key={idx}
                        class="block filled-button text-xl"
                        onClick$={() => {
                          if (answer === quizState.current?.quiz.content.correctAnswer) {
                            handleCorrect()
                          } else {
                            handleInorrect(answer)
                          }
                        }}
                      >{ answer }</button>))
                  }
                </div>
              </div>
            </div>
        }
      </> : <div class="text-center text-3xl">
        生成中..
      </div>
    }
  </>
})
