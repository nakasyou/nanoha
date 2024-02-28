import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(globalThis.prompt as unknown as boolean ? prompt('Gemini token?') ?? '' : '')

export async function generateByGemini(prompt: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
  const result = await model.generateContent(prompt)
  const response = await result.response
  const text = response.text()
  return text
}