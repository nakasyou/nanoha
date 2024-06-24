import { getGeminiApiToken } from './store'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const getGoogleGenerativeAI = (): GoogleGenerativeAI | null => {
  const apiKey = getGeminiApiToken()
  if (!apiKey) {
    return null
  }
  return new GoogleGenerativeAI(apiKey)
}
