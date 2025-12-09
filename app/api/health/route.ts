import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Simple healthcheck - don't check database to avoid blocking deployment
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      server: 'running'
    }
  });
}