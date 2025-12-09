import { sign, verify } from 'jsonwebtoken'
import { hash, compare } from 'bcrypt'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

// Server-side only functions (can use next/headers)
export async function setAuthCookie(token: string) {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  })
}

export async function getAuthToken() {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  return cookieStore.get('session')?.value
}

export async function clearAuthCookie() {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

// Wrapper function for backward compatibility
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

// Universal functions (work on both client and server)
export function generateToken(payload: any) {
  return sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string) {
  try {
    return { payload: verify(token, JWT_SECRET), expired: false }
  } catch (error: any) {
    return { payload: null, expired: error.name === 'TokenExpiredError' }
  }
}

export async function hashPassword(password: string) {
  return hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return compare(password, hashedPassword)
}