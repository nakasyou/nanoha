import { array, number, object, string, type Output } from "valibot"

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
  /** 回答の選択肢 */
  answers: string[]
  /** 正解のインデックス */
  correctIndex: number
  /** 解説 */
  explanation: string
}
\`\`\`
1つのJSONは絶対に改行したりフォーマットしたりせずにMinifyされた状態にし、JSONL形式で出力しなさい。

ソーステキスト:
`.trim()

export const QUESTION_SCHEMA = object({
  question: string(),
  answers: array(string()),
  correctIndex: number(),
  explanation: string()
})
export type Question = Output<typeof QUESTION_SCHEMA>