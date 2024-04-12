import { GoogleGenerativeAI } from '@google/generative-ai'
import { getGeminiApiToken } from './store'

export const generateWithLLM = (prompt: string) => {
  const apiKey = getGeminiApiToken()
  if (!apiKey) {
    return null
  }
  const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
    model: 'gemini-pro'
  })
  return async function* () {
    const stream = await model.generateContentStream(prompt)
    for await (const res of stream.stream) {
      yield res.text()
    }
  }
}
