import { safeParse } from 'valibot'
import type { TextNoteData } from '../../note/components/notes/TextNote/types'
import { getGoogleGenerativeAI } from '../../shared/gemini'
import {
  CONTENT_SCHEMA,
  PROMPT_TO_GENERATE_SELECT_QUIZ,
  type QuizContent,
} from '../constants'
import type { MargedNoteData } from '../../note/components/notes-utils'
import type { GenerativeModel } from '@google/generative-ai'

export class QuizzesGenerator {
  #noteDatas: TextNoteData[]
  #model: GenerativeModel
  constructor (noteDatas: MargedNoteData[]) {
    this.#noteDatas = noteDatas.filter((note) => note.type === 'text')

    const gemini = getGoogleGenerativeAI()

    if (!gemini) {
      throw new Error('No gemini')
    }
  
    this.#model = gemini.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
      systemInstruction: {
        role: 'system',
        parts: [{ text: PROMPT_TO_GENERATE_SELECT_QUIZ }],
      },
    })
  }
  
  async generateQuizzes (): Promise<QuizContent[]> {
    const note = this.#noteDatas[Math.floor(Math.random() * this.#noteDatas.length)]

    const res = await this.#model
      .startChat()
      .sendMessage(note?.canToJsonData.html || '')

    let contents: unknown
    try {
      contents = JSON.parse(res.response.text())
    } catch {
      // Unable to parse
      return []
    }

    if (!Array.isArray(contents)) {
      return []
    }

    const quizzes = await Promise.all(
      contents.filter(
        (content): content is QuizContent =>
          safeParse(CONTENT_SCHEMA, content).success,
      ),
    )
    return quizzes
  }
}
