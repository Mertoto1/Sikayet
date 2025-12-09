import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

// Define protected routes
const protectedRoutes = ['/admin', '/company', '/profile']
const adminRoutes = ['/admin']
const companyRoutes = ['/company']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if the route requires authentication
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))
  const isCompanyRoute = companyRoutes.some(route => pathname.startsWith(route))
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  // If not a protected route, continue
  if (!isProtectedRoute) {
    return NextResponse.next()
  }
  
  // Get session cookie
  const sessionCookie = request.cookies.get('session')
  
  // If protected route but no session, redirect to login
  if (!sessionCookie || !sessionCookie.value) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Verify JWT token using jose (Edge Runtime compatible)
  try {
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(sessionCookie.value, secret)
    
    const decoded = payload as any
    
    // Check role-based access
    if (isAdminRoute && decoded.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    if (isCompanyRoute && decoded.role !== 'COMPANY' && decoded.role !== 'COMPANY_PENDING' && decoded.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    return NextResponse.next()
  } catch (error) {
    // Invalid or expired token
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('session')
    return response
  }
}

export const config = {
  matcher: ['/admin/:path*', '/company/:path*', '/profile/:path*'],
}