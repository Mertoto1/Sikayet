import { NextResponse } from 'next/server'
import { rateLimit, getClientIdentifier, authRateLimit, apiRateLimit, uploadRateLimit } from '@/lib/rate-limit'
import { sanitizeInput } from '@/lib/xss-protection'

/**
 * Rate limit middleware wrapper for API routes
 */
export function withRateLimit(
  handler: (request: Request) => Promise<NextResponse>,
  limiter = apiRateLimit
) {
  return async (request: Request): Promise<NextResponse> => {
    const identifier = getClientIdentifier(request)
    const result = limiter(identifier)

    if (!result.allowed) {
      return NextResponse.json(
        { error: 'Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '60',
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
          }
        }
      )
    }

    // Add rate limit headers to response
    const response = await handler(request)
    response.headers.set('X-RateLimit-Limit', '60')
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
    response.headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString())

    return response
  }
}

/**
 * Sanitize request body to prevent XSS
 */
export function sanitizeRequestBody(body: any): any {
  if (!body) return body

  if (typeof body === 'string') {
    return sanitizeInput(body, false)
  }

  if (Array.isArray(body)) {
    return body.map(item => sanitizeRequestBody(item))
  }

  if (typeof body === 'object') {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(body)) {
      // Don't sanitize certain fields that need HTML (like email content)
      if (key === 'content' || key === 'message' || key === 'description') {
        sanitized[key] = typeof value === 'string' ? sanitizeInput(value, true) : value
      } else {
        sanitized[key] = sanitizeRequestBody(value)
      }
    }
    return sanitized
  }

  return body
}

