import { GoogleGenerativeAI, type Part } from '@google/generative-ai'
import { getGeminiApiToken } from './store'

type Prompt = string | Blob

export const generateWithLLM = (input: Prompt[] | Prompt, modelLabel: 'gemini-pro' | 'gemini-pro-vision'): null | AsyncGenerator<string, void, unknown> => {
  const apiKey = getGeminiApiToken()
  if (!apiKey) {
    return null
  }
  const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
    model: modelLabel
  })
  return (async function* () {
    const prompts = Array.isArray(input) ? input : [input]

    const inputPrompts = await Promise.all(prompts.map(async (prompt) => {
      if (prompt instanceof Blob) {
        const b64Image = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string).split(',')[1]!)
          reader.readAsDataURL(prompt)
        })
      
        return {
          inlineData: {
            data: b64Image,
            mimeType: prompt.type
          }
        }
      }
      return {
        text: prompt
      }
    }))
    const stream = await model.generateContentStream(inputPrompts)
    for await (const res of stream.stream) {
      const text = res.text()
      yield text
    }
  })()
}
