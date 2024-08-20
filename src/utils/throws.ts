export const handleError = <T>(fn: () => T): {
  error: unknown
  success: false
  result: null
} | {
  error: null
  success: true
  result: T
}=> {
  try {
    return {
      error: null,
      success: true,
      result: fn(),
    }
  } catch (e) {
    return {
      error: e,
      success: false,
      result: null,
    }
  }
}
