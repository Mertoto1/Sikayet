// Client-safe auth functions (no bcrypt)
export function generateToken(payload: any) {
  // This should only be used on server side
  throw new Error('generateToken should only be used on server side')
}

export function verifyToken(token: string) {
  try {
    // Simple JWT verification for client side
    // In production, this should use a proper JWT library
    const parts = token.split('.')
    if (parts.length !== 3) return { payload: null, expired: true }
    
    const payload = JSON.parse(atob(parts[1]))
    const now = Math.floor(Date.now() / 1000)
    
    return { 
      payload: payload.exp > now ? payload : null, 
      expired: payload.exp <= now 
    }
  } catch (error) {
    return { payload: null, expired: true }
  }
}
