import { GoogleGenerativeAI } from '@google/generative-ai'
import { getGeminiApiToken } from './store'

export const getGoogleGenerativeAI = (): GoogleGenerativeAI | null => {
  const apiKey = getGeminiApiToken()
  if (!apiKey) {
    return null
  }
  return new GoogleGenerativeAI(apiKey)
}
