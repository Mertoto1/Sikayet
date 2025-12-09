// XSS Protection utilities
// Next.js already has built-in XSS protection, but this adds extra sanitization

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty) return ''
  
  // Basic HTML sanitization - remove script tags and dangerous attributes
  let clean = dirty
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframes
  
  return clean
}

/**
 * Sanitize plain text (remove HTML tags)
 */
export function sanitizeText(text: string): string {
  if (!text) return ''
  
  // Remove HTML tags
  return text.replace(/<[^>]*>/g, '').trim()
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
  if (!text) return ''
  
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  
  return text.replace(/[&<>"']/g, (m) => map[m])
}

/**
 * Validate and sanitize user input
 */
export function sanitizeInput(input: string, allowHtml: boolean = false): string {
  if (!input) return ''
  
  if (allowHtml) {
    return sanitizeHtml(input)
  } else {
    return sanitizeText(input)
  }
}

