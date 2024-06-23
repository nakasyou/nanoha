import { array, object, string, type InferOutput } from "valibot"

/**
 * Prompt to generate question
 */
export const PROMPT_TO_GENERATE_QUESTION = `
あなたは学習用の問題を生成するAIです。
ユーザーからのソースに従って、問題を生成してください。

クイズは、以下のTypeScriptのinterfaceに当てはまるJSONで出力してください。
\`\`\`ts
interface Question {
  /** 問題文 */
  question: string

  /** 不正解時に表示される解説 */
  explanation: string

  /** 正解 */
  correctAnswer: string

  /** 不正解と明らかなダミー */
  damyAnswers: string[]
}
\`\`\`
1つのJSONは絶対に改行したりフォーマットしたりせずにMinifyされた状態にし、JSONL形式で出力しなさい。

ソーステキスト:
`.trim()

export const CONTENT_SCHEMA = object({
  question: string(),
  explanation: string(),
  correctAnswer: string(),
  damyAnswers: array(string()),
})

export type QuizContent = InferOutput<typeof CONTENT_SCHEMA>
