// Simple in-memory rate limiter
// For production, consider using Redis-based solution like @upstash/ratelimit

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
}

export function rateLimit(options: RateLimitOptions) {
  const { windowMs, maxRequests } = options

  return (identifier: string): { allowed: boolean; remaining: number; resetTime: number } => {
    const now = Date.now()
    const key = identifier
    const record = store[key]

    // Clean up old records periodically
    if (Math.random() < 0.01) {
      // 1% chance to clean up
      Object.keys(store).forEach(k => {
        if (store[k].resetTime < now) {
          delete store[k]
        }
      })
    }

    if (!record || record.resetTime < now) {
      // Create new record or reset expired one
      store[key] = {
        count: 1,
        resetTime: now + windowMs
      }
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: now + windowMs
      }
    }

    if (record.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime
      }
    }

    record.count++
    return {
      allowed: true,
      remaining: maxRequests - record.count,
      resetTime: record.resetTime
    }
  }
}

// Pre-configured rate limiters
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5 // 5 login attempts per 15 minutes
})

export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60 // 60 requests per minute
})

export const uploadRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10 // 10 uploads per minute
})

// Get client identifier from request
export function getClientIdentifier(request: Request): string {
  // Try to get IP from headers (works with proxies)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || 'unknown'
  
  return ip
}

