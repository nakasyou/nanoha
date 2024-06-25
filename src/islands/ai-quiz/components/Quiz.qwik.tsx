/** @jsxImportSource @builder.io/qwik */
import { $, component$, useContext, useContextProvider, useSignal, useStore, useStylesScoped$, useVisibleTask$ } from '@builder.io/qwik'
import { QUIZ_STATE_CTX, SCREEN_STATE_CTX, type Quiz, type QuizState } from '../store'
import { shuffle } from '../../../utils/arr'
import { Incorrect } from './Incorrect.qwik'
import { FinishedScreen } from './Finished.qwik'
import { getGoogleGenerativeAI } from '../../shared/gemini'
import { CONTENT_SCHEMA, PROMPT_TO_GENERATE_SELECT_QUIZ, type QuizContent } from '../constants'
import { safeParse } from 'valibot'
import { Loading } from './Utils.qwik'

export const QuizScreen = component$(() => {
  const quizState = useStore<QuizState>({
    correctQuizzes: [],
    incorrectQuizzes: [],

    quizzes: [],
    current: null,
    goalQuestions: 5,

    isFinished: false,

    generatedQuizzes: 0
  }, {
    deep: false
  })
  useContextProvider(QUIZ_STATE_CTX, quizState)
  const screenState = useContext(SCREEN_STATE_CTX)

  const isShownCorrectDialog = useSignal(false)
  const isShownIncorrectScreen = useSignal<false | {
    incorrectAnswer: string
  }>(false)

  const setQuiz = $(() => {
    const nextQuizIndex = Math.floor(Math.random() * quizState.quizzes.length)
    const nextQuiz = quizState.quizzes[nextQuizIndex]
    if (!nextQuiz) {
      return
    }
    quizState.current = {
      quiz: nextQuiz,
      choices: shuffle([
        ...nextQuiz.content.damyAnswers,
        nextQuiz.content.correctAnswer
      ]),
      index: (quizState.current?.index ?? -1) + 1
    }
    const nextQuizzes = [...quizState.quizzes].splice(nextQuizIndex, 1)
    quizState.quizzes = nextQuizzes
  })
  useVisibleTask$(async ({ track }) => {
    track(() => quizState.isFinished)
    isShownIncorrectScreen.value = false
    // Generate Quizzes
    if (screenState.note === 'pending' || screenState.note === 'notfound' || screenState.note === 'invalid') {
      return
    }
    const gemini = getGoogleGenerativeAI()
    if (!gemini) {
      return alert('AIエラー')
    }
    const model = await gemini.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json'
      },
      systemInstruction: {
        role: 'system',
        parts: [{ text: PROMPT_TO_GENERATE_SELECT_QUIZ }]
      }
    })

    const sourceNotes = screenState.note!.notes.filter(note => note.type === 'text')

    while (true) {
      if (quizState.generatedQuizzes >= quizState.goalQuestions) {
        break
      }
      const randomNote = sourceNotes[Math.floor(Math.random() * sourceNotes.length)]!

      const res = await model.startChat().sendMessage(randomNote?.canToJsonData.html || '')
      
      const contents: unknown[] = JSON.parse(res.response.text())

      const quizzes = contents.filter((content): content is QuizContent => safeParse(CONTENT_SCHEMA, content).success).map(content => ({
        content: content,
        source: randomNote
      } satisfies Quiz))

      quizState.generatedQuizzes += quizzes.length
      quizState.quizzes = [
        ...quizState.quizzes,
        ...quizzes
      ]
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
    if (quizState.goalQuestions === (quizState.current?.index ?? 0) + 1) {
      quizState.isFinished = true
      return
    }
    isShownIncorrectScreen.value = false
    setQuiz()
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
                        type="button"
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
        生成中<Loading />
      </div>
    }
  </>
})
