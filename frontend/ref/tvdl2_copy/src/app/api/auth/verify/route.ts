import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt-server';

// Force Node.js runtime
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    return NextResponse.json({ 
      valid: true, 
      user: {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      }
    });
    
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    return NextResponse.json({ 
      valid: true, 
      user: {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      }
    });
    
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}