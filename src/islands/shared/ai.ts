import { GoogleGenerativeAI } from '@google/generative-ai'
import { getGeminiApiToken } from './store'

export const generateWithLLM = (prompt: string): null | AsyncGenerator<string, void, unknown> => {
  const apiKey = getGeminiApiToken()
  if (!apiKey) {
    return null
  }
  const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
    model: 'gemini-pro'
  })
  return (async function* () {
    const stream = await model.generateContentStream(prompt)
    for await (const res of stream.stream) {
      const text = res.text()
      yield text
    }
  })()
}
