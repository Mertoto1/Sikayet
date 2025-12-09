import { verifyToken, getAuthToken } from './auth'

// Server-side session management
export async function getSession() {
  try {
    const token = await getAuthToken()
    if (!token) return null

    const { payload, expired } = verifyToken(token)
    if (payload && !expired) {
      return payload
    }
    return null
  } catch (error) {
    return null
  }
}