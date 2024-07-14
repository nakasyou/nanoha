import { GoogleGenerativeAI, type Part, type Content } from '@google/generative-ai'
import { getGeminiApiToken } from './store'

type Generated = null | AsyncGenerator<string, void, unknown>
interface GenerateWithLLM {
  (input: string[], modelLabel: 'gemini-pro', systemPrompt?: string): Generated
  (
    input: (string | Blob)[],
    modelLabel: 'gemini-pro-vision',
    systemPrompt?: string,
  ): Generated
}
export const generateWithLLM: GenerateWithLLM = (
  input,
  modelLabel,
  systemPrompt,
) => {
  const apiKey = getGeminiApiToken()
  if (!apiKey) {
    return null
  }
  const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
    model: modelLabel,
  })
  return (async function* () {
    const inputPrompts = await Promise.all(
      input.map(async (prompt): Promise<Content> => {
        if (prompt instanceof Blob) {
          const b64Image = await new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () =>
              resolve((reader.result as string).split(',')[1]!)
            reader.readAsDataURL(prompt)
          })
          return {
            parts: [
              {
                inlineData: {
                  data: b64Image,
                  mimeType: prompt.type,
                },
              },
            ],
            role: 'user',
          }
        }
        return {
          parts: [
            {
              text: prompt,
            },
          ],
          role: 'user',
        }
      }),
    )
    try {
      const stream = await model.generateContentStream({
        contents: inputPrompts,
        systemInstruction: systemPrompt,
      })
      for await (const res of stream.stream) {
        res.candidates
        const text = res.text()
        yield text
      }
    } catch (e) {
      yield `生成中にエラーが発生しました: \n${JSON.stringify(e)}`
    }
  })()
}
