import { User, Role, Status } from '@prisma/client';
import { prisma } from '@/lib/prisma';

// Export Prisma User type directly
export type IUser = User;

// Export enums for convenience
export { Role, Status };

// User utility functions
export class UserModel {
  /**
   * Create a new user
   */
  static async create(data: {
    name: string;
    email: string;
    password: string;
    role?: Role;
    status?: Status;
    avatar?: string;
    bio?: string;
    location?: string;
  }) {
    return await prisma.user.create({
      data: {
        ...data,
        role: data.role || Role.USER,
        status: data.status || Status.PENDING,
      },
    });
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find user by ID
   */
  static async findById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Update user
   */
  static async update(id: string, data: Partial<User>) {
    return await prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete user
   */
  static async delete(id: string) {
    return await prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Get user without password (safe for API responses)
   */
  static async findByIdSafe(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatar: true,
        bio: true,
        location: true,
        joinDate: true,
        lastLogin: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Get users by role
   */
  static async findByRole(role: Role) {
    return await prisma.user.findMany({
      where: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatar: true,
        joinDate: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Get users by status
   */
  static async findByStatus(status: Status) {
    return await prisma.user.findMany({
      where: { status },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatar: true,
        joinDate: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Update user stats
   */
  static async updateStats(id: string, stats: {
    posts?: number;
    likes?: number;
    comments?: number;
  }) {
    return await prisma.user.update({
      where: { id },
      data: stats,
    });
  }

  /**
   * Update last login
   */
  static async updateLastLogin(id: string) {
    return await prisma.user.update({
      where: { id },
      data: {
        lastLogin: new Date(),
      },
    });
  }
}

// Export default for backward compatibility
export default UserModel;