import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function POST(request: Request) {
  // Clear the session cookie
  (await cookies()).delete('session')
  
  // Check if this is a form submission (HTML form) or AJAX request
  const referer = request.headers.get('referer')
  const contentType = request.headers.get('content-type') || ''
  
  // If it's a form submission from HTML, redirect to home page
  if (referer && (!contentType.includes('application/json'))) {
    return new Response(null, {
      status: 302,
      headers: {
        'Location': '/'
      }
    })
  }
  
  // For AJAX requests, return JSON
  return NextResponse.json({ success: true })
}