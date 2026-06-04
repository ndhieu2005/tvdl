import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Test database connection
    console.log('🔍 Health Check - Testing database connection...');
    
    await prisma.$connect();
    const dbTestResult = await prisma.$queryRaw`SELECT 1 as test`;
    
    // Test settings table
    const settingsCount = await prisma.settings.count();
    
    // Test other important tables
    const usersCount = await prisma.user.count();
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log('✅ Health Check - All systems operational');
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      database: {
        connected: true,
        testQuery: dbTestResult,
        tables: {
          settings: settingsCount,
          users: usersCount
        }
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        databaseUrl: process.env.DATABASE_URL ? 'configured' : 'missing'
      }
    });
    
  } catch (error) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.error('❌ Health Check - System unhealthy:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      code: (error as any)?.code,
      meta: (error as any)?.meta
    });
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: (error as any)?.code,
        type: error instanceof Error ? error.constructor.name : 'UnknownError'
      },
      database: {
        connected: false
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        databaseUrl: process.env.DATABASE_URL ? 'configured' : 'missing'
      }
    }, { status: 503 });
  } finally {
    await prisma.$disconnect();
  }
}