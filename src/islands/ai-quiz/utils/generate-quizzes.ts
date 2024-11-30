import { safeParse } from 'valibot'
import type { TextNoteData } from '../../note/components/notes/TextNote/types'
import { getGoogleGenerativeAI } from '../../shared/gemini'
import {
  CONTENT_SCHEMA,
  PROMPT_TO_GENERATE_SELECT_QUIZ,
  type QuizContent,
} from '../constants'

export const quizzesGenerator = () => {
  const gemini = getGoogleGenerativeAI()
  if (!gemini) {
    return null
  }

  const model = gemini.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    },
    systemInstruction: {
      role: 'system',
      parts: [{ text: PROMPT_TO_GENERATE_SELECT_QUIZ }],
    },
  })

  return async function generatedQuizzes(
    note: TextNoteData,
  ): Promise<QuizContent[]> {
    const res = await model
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
