import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    // Check cookie from request
    const sessionCookie = request.cookies.get('session')
    
    // Check session from server-side function
    const session = await getSession()
    
    return NextResponse.json({
      cookieExists: !!sessionCookie,
      cookieValue: sessionCookie?.value ? 'present' : 'missing',
      sessionExists: !!session,
      sessionData: session,
      allCookies: Object.fromEntries(
        request.cookies.getAll().map(c => [c.name, c.value ? 'present' : 'missing'])
      )
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Error checking cookie',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

