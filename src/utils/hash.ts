const encoder = new TextEncoder()
export const sha256 = async (data: Uint8Array | string): Promise<string> => {
  const hashBuffer = await crypto.subtle.digest('SHA-256', typeof data === 'string' ? encoder.encode(data) : data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
