/** @jsxImportSource @builder.io/qwik */
import { component$, useContext, useContextProvider, useStore, useVisibleTask$ } from '@builder.io/qwik'
import { QUIZ_STATE_CTX, SCREEN_STATE_CTX, type QuizState } from '../store'

export const QuizScreen = component$(() => {
  const quizState = useStore<QuizState>({
    correctQuizzes: [],
    incorrectQuizzes: [],

    quizzes: [],
    current: null,
    goalQuestions: 5
  }, {
    deep: false
  })
  useContextProvider(QUIZ_STATE_CTX, quizState)
  const screenState = useContext(SCREEN_STATE_CTX)

  useVisibleTask$(async () => {
    // Generate Quizzes

    while (true) {
      if (quizState.quizzes.length >= quizState.goalQuestions) {
        break
      }
      quizState.quizzes = [
        ...quizState.quizzes,
        {
          content: {
            
          },
          source: screenState.note
        }
      ]
    }
  })
  return <div>
    
  </div>
})
