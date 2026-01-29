/**
 * Client-side authentication token management
 * Handles storing and retrieving JWT tokens in localStorage
 */

const TOKEN_KEY = 'hospiai_auth_token'
const TOKEN_EXPIRY_KEY = 'hospiai_auth_token_expiry'

export interface AuthToken {
  access_token: string
  token_type: string
  expires_in: number
}

/**
 * Store authentication token in localStorage
 */
export function setAuthToken(token: AuthToken): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(TOKEN_KEY, token.access_token)

    // Calculate expiry timestamp
    const expiryTime = Date.now() + token.expires_in * 1000
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString())
  } catch (error) {
    console.error('Failed to store auth token:', error)
  }
}

/**
 * Get authentication token from localStorage
 * Returns null if token doesn't exist or is expired
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null

  try {
    const token = localStorage.getItem(TOKEN_KEY)
    const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY)

    if (!token || !expiryTime) return null

    // Check if token is expired
    if (Date.now() >= parseInt(expiryTime)) {
      clearAuthToken()
      return null
    }

    return token
  } catch (error) {
    console.error('Failed to retrieve auth token:', error)
    return null
  }
}

/**
 * Clear authentication token from localStorage
 */
export function clearAuthToken(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(TOKEN_EXPIRY_KEY)
  } catch (error) {
    console.error('Failed to clear auth token:', error)
  }
}

/**
 * Check if user is authenticated (has valid token)
 */
export function isAuthenticated(): boolean {
  return getAuthToken() !== null
}

/**
 * Get Authorization header value for API calls
 */
export function getAuthHeader(): string | null {
  const token = getAuthToken()
  return token ? `Bearer ${token}` : null
}
