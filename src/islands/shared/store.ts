export const getGeminiApiToken = (): string | null => localStorage.getItem('GEMINI_API_TOKEN')
export const setGeminiApiToken = (apiKey: string): void => localStorage.setItem('GEMINI_API_TOKEN', apiKey)
