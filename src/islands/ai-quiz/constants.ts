import { type InferOutput, array, object, string } from 'valibot'
import selectQuestion from './schemas/select-question.json'

/**
 * Prompt to generate question
 */
export const PROMPT_TO_GENERATE_SELECT_QUIZ = `
あなたは学習用の問題を生成するAIです。
ユーザーからの文章の中の情報のみを使用して、重複のない問題を生成してください。

以下のJSONスキーマに従いなさい。
${JSON.stringify(selectQuestion)}
`.trim()

export const CONTENT_SCHEMA = object({
  question: string(),
  explanation: string(),
  correctAnswer: string(),
  damyAnswers: array(string()),
})

export type QuizContent = InferOutput<typeof CONTENT_SCHEMA>
