import { parse, safeParse } from 'valibot'
import { getGoogleGenerativeAI } from '../shared/gemini'
import { CONTENT_SCHEMA, PROMPT_TO_GENERATE_SELECT_QUIZ, type QuizContent } from './constants'
import type { MargedNoteData } from '../note/components/notes-utils'
import type { TextNoteData } from '../note/components/notes/TextNote/types'
import type { QuizDB, Quizzes } from './storage'
import { shuffle } from '../../utils/arr'

const generateQuizzesFromAI = async (text: string): Promise<QuizContent[]> => {
  const gemini = getGoogleGenerativeAI()
  if (!gemini) {
    throw new Error('Gemini is null.')
  }
  const response = await gemini.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      responseMimeType: 'application/json'
    },
    systemInstruction: {
      role: 'system',
      parts: [{ text: PROMPT_TO_GENERATE_SELECT_QUIZ }],
    }
  }).startChat().sendMessage(text)

  let json: unknown
  try {
    json = JSON.parse(response.response.text())
  } catch {
    return []
  }
  if (!Array.isArray(json)) {
    return []
  }
  return json.filter(r => safeParse(CONTENT_SCHEMA, r).success)
}

export interface GeneratedQuiz {
  content: QuizContent
  noteDataId: string
  reason: 'new'
}
export class QuizManager {
  #db: QuizDB
  constructor(db: QuizDB) {
    this.#db = db
  }
  async #getNeverProposedQuizzes(noteId: number) {
    const quizzes = await this.#db.quizzes.where({
      noteId,
      proposeCount: 0
    }).toArray()
    return quizzes
  }
  async #addProposedQuizz(notes: MargedNoteData[], noteId: number) {
    const textNotes = notes.filter(note => note.type === 'text') as TextNoteData[]
    const randomTextNote = textNotes[Math.floor(textNotes.length * Math.random())]
    const generated = await generateQuizzesFromAI(randomTextNote?.canToJsonData.html ?? '')

    const quizzes = generated.map(content => ({
      content,
      correctCount: 0,
      proposeCount: 0,
      noteDataId: randomTextNote?.id ?? '',
      noteId
    } satisfies Quizzes))

    await this.#db.quizzes.bulkAdd(quizzes)
  }
  async generateQuizzes(n: number, notes: MargedNoteData[], noteId: number): Promise<GeneratedQuiz[]> {
    while (true) {
      const gotQuizzes = await this.#getNeverProposedQuizzes(noteId)
      if (gotQuizzes.length >= n) {
        return shuffle(gotQuizzes).map(data => ({
          content: data.content,
          noteDataId: data.noteDataId,
          reason: 'new'
        }))
      }
      await this.#addProposedQuizz(notes, noteId)
    }
  }
}
