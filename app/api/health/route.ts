import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        server: 'running'
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      services: {
        database: 'disconnected',
        server: 'running',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}