import encryption from '@adonisjs/core/services/encryption'

export interface TokenPayload {
  userId: number
  email: string
}

/**
 * Generates a token for the given payload and expiration time.
 * @param {TokenPayload} payload - The payload to be encrypted.
 * @param {number} expiresInSeconds - The expiration time in seconds.
 * @returns {string} - The generated token.
 */
export function generateToken(payload: TokenPayload, expiresInSeconds: number): string {
  return encryption.encrypt(JSON.stringify(payload), `${expiresInSeconds} seconds`)
}

/**
 * Verifies the token and returns the payload if valid.
 * @param {string} token - The token to be verified.
 * @returns {T | null} - The decrypted payload or null if invalid.
 */
export function verifyToken<T = TokenPayload>(token: string): T | null {
  try {
    const decrypted = encryption.decrypt(token) as any
    return JSON.parse(decrypted) as T
  } catch {
    return null
  }
}
