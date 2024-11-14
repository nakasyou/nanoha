import { GoogleGenerativeAI } from '@google/generative-ai'
import { getGeminiApiToken } from './store'

export const getGoogleGenerativeAI = (): GoogleGenerativeAI | null => {
  const apiKey = getGeminiApiToken()
  if (!apiKey) {
    return null
  }
  return new GoogleGenerativeAI(apiKey)
}
export const getGemini = (): GoogleGenerativeAI => {const ai = getGoogleGenerativeAI();if (!ai) {if (confirm('AI 機能が設定されていません。\n設定を開きますか？')) {location.href = '/app/settings#ai'}throw 0}return ai}
