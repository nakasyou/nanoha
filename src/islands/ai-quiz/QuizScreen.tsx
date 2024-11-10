import { createSignal, onMount } from 'solid-js'
import { QuizManager, type GeneratedQuiz } from './quiz-manager'
import type { MargedNoteData } from '../note/components/notes-utils'
import { QuizDB, type Quizzes } from './storage'


export const QuizScreen = (props: {
  notes: MargedNoteData[]
  noteId: number
}) => {
  const [getQuizzes, setQuizzes] = createSignal<GeneratedQuiz[]>([])
  const [getQuizIndex, setQuizIndex] = createSignal(0)

  onMount(async () => {
    // Init
    const db = new QuizDB()
    const quizManager = new QuizManager(db)

    // Generate
    const generated = await quizManager.generateQuizzes(5, props.notes, props.noteId)
    setQuizzes(generated)
  })

  return <div class="h-full">
    <div>{JSON.stringify(getQuizzes()[getQuizIndex()])}</div>
  </div>
}
