import { type InferOutput, array, number, object, string } from 'valibot'
import selectQuestion from './schemas/select-question.json'

/**
 * Prompt to generate question
 */
export const PROMPT_TO_GENERATE_SELECT_QUIZ = `
あなたは学習用の問題を生成するAIです。
ユーザーからの文章の中の情報からわかること以外のことは入れない問題を生成しなさい。
答えの数は1つでも、複数でも構いません。複数の場合、それは完答式になります。

以下のJSONスキーマに従いなさい。
${JSON.stringify(selectQuestion)}
`.trim()

export const CONTENT_SCHEMA = object({
  question: string(),
  explanation: string(),
  damys: array(string()),
  corrects: array(string()),
})

export type QuizContent = InferOutput<typeof CONTENT_SCHEMA>
