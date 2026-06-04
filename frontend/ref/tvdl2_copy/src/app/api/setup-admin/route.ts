import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Role, Status } from '@prisma/client';
import { hashPassword } from '@/lib/jwt';

// Development only - setup admin user
export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: Role.ADMIN,
        status: Status.ACTIVE,
        emailVerified: true, // Admin user should be verified by default
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      }
    });

    return NextResponse.json({
      success: true,
      data: adminUser,
      message: 'Admin user created successfully'
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create admin user' },
      { status: 500 }
    );
  }
}