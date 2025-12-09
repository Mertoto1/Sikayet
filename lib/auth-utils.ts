import { JwtPayload } from 'jsonwebtoken';

/**
 * Type guard to check if session is a JwtPayload object with role property
 */
export function isSessionWithRole(session: string | JwtPayload | null): session is JwtPayload & { role: string } {
  return (
    session !== null &&
    typeof session === 'object' &&
    (session as JwtPayload).hasOwnProperty('role')
  );
}

/**
 * Check if user has admin role
 */
export function isAdmin(session: string | JwtPayload | null): boolean {
  return isSessionWithRole(session) && session.role === 'ADMIN';
}

/**
 * Check if user has company role
 */
export function isCompany(session: string | JwtPayload | null): boolean {
  return (
    isSessionWithRole(session) &&
    (session.role === 'COMPANY' || session.role === 'COMPANY_PENDING')
  );
}