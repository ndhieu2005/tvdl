import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Kiểm tra database connection nếu cần
    // await prisma.$queryRaw`SELECT 1`
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '0.1.0'
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Database connection failed',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    )
  }
}