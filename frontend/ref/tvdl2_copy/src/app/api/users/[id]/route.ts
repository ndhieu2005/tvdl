import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Role, Status } from '@prisma/client';
import { hashPassword } from '@/lib/jwt';

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: Role;
  status?: Status;
  location?: string;
  bio?: string;
  emailVerified?: boolean;
  avatar?: string;
  action?: string; // For special actions like reset_password
}

export interface UserFromDB {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  location: string | null;
  bio: string | null;
  emailVerified: boolean;
  avatar: string | null;
  joinDate: Date;
  lastLogin: Date;
  posts: number;
  likes: number;
  comments: number;
  createdAt: Date;
  updatedAt: Date;
}

// GET /api/users/[id] - Lấy thông tin user theo ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const user = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Không tìm thấy user' },
        { status: 404 }
      );
    }

    // Transform response
    const transformedUser = {
      ...user,
      location: user.location || '',
      bio: user.bio || '',
      avatar: user.avatar || '',
      joinDate: user.joinDate.toISOString().split('T')[0],
      lastLogin: user.lastLogin.toISOString(),
      stats: {
        posts: user.posts
      }
    };

    return NextResponse.json({ user: transformedUser });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi lấy thông tin user' },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Cập nhật thông tin user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateUserRequest = await request.json();

    // Chuyển đổi role và status thành chữ hoa để xử lý không phân biệt case
    const roleFromRequest = body.role ? body.role.toUpperCase() : undefined;
    const statusFromRequest = body.status ? body.status.toUpperCase() : undefined;

    // Validate role and status if provided
    if (body.role && roleFromRequest) {
      const validRoles = ['ADMIN', 'EDITOR', 'USER'];
      if (!validRoles.includes(roleFromRequest)) {
        return NextResponse.json(
          { error: 'Role không hợp lệ. Chỉ chấp nhận: ADMIN, EDITOR, USER' },
          { status: 400 }
        );
      }
    }

    if (body.status && statusFromRequest) {
      const validStatuses = ['ACTIVE', 'INACTIVE', 'PENDING'];
      if (!validStatuses.includes(statusFromRequest)) {
        return NextResponse.json(
          { error: 'Status không hợp lệ. Chỉ chấp nhận: ACTIVE, INACTIVE, PENDING' },
          { status: 400 }
        );
      }
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'Không tìm thấy user' },
        { status: 404 }
      );
    }

    // Check if email is being changed and already exists
    if (body.email && body.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: body.email }
      });
      
      if (emailExists) {
        return NextResponse.json(
          { error: 'Email đã được sử dụng' },
          { status: 400 }
        );
      }
    }

    // Handle special actions
    if (body.action === 'reset_password') {
      // Reset password to default hashed value
      const hashedPassword = await hashPassword('temp_password_needs_reset');
      
      const updatedUser = await prisma.user.update({
        where: { id },
        data: { 
          password: hashedPassword
        }
      });
      
      return NextResponse.json({
        message: 'Reset mật khẩu thành công. User sẽ phải đổi mật khẩu lần đầu khi đăng nhập.',
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email
        }
      });
    }

    // Prepare update data with proper enum conversion
    const updateData: any = { ...body };
    
    // Remove action field from update data
    delete updateData.action;
    
    // Convert role and status to proper enum values if provided
    if (body.role && roleFromRequest) {
      updateData.role = roleFromRequest as Role;
    }
    if (body.status && statusFromRequest) {
      updateData.status = statusFromRequest as Status;
    }

    // Update avatar if name changed
    if (body.name) {
      updateData.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(body.name)}&background=7c3aed&color=fff`;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData
    });

    // Transform response
    const transformedUser = {
      ...updatedUser,
      location: updatedUser.location || '',
      bio: updatedUser.bio || '',
      avatar: updatedUser.avatar || '',
      joinDate: updatedUser.joinDate.toISOString().split('T')[0],
      lastLogin: updatedUser.lastLogin.toISOString()
    };

    return NextResponse.json({
      message: 'Cập nhật user thành công',
      user: transformedUser
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi cập nhật user' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Xóa user một cách an toàn
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
    await prisma.$transaction(async (tx) => {
      // Check if user exists
      const user = await tx.user.findUnique({
        where: { id },
        include: {
          authoredPosts: true,
          uploadedMedia: true,
          sessionTokens: true,
          apiKeys: true,
        }
      });
      
      if (!user) {
        throw new Error('Không tìm thấy user');
      }

      // Không cho phép xóa admin cuối cùng
      if (user.role === Role.ADMIN) {
        const adminCount = await tx.user.count({
          where: { role: Role.ADMIN }
        });
        
        if (adminCount === 1) {
          throw new Error('Không thể xóa admin cuối cùng');
        }
      }

      // Tìm admin user để thay thế trong các field createdBy/updatedBy
      const adminUser = await tx.user.findFirst({
        where: { 
          role: Role.ADMIN,
          id: { not: id } // Không lấy user đang bị xóa
        }
      });
      
      const replacementUserId = adminUser ? adminUser.id : 'system';

      // Cập nhật các field createdBy và updatedBy
      console.log('Updating references before deletion...');

      // Update Tags.createdBy
      await tx.tag.updateMany({
        where: { createdBy: id },
        data: { createdBy: replacementUserId }
      });

      // Update Posts.createdBy
      await tx.post.updateMany({
        where: { createdBy: id },
        data: { createdBy: replacementUserId }
      });

      // Update SecuritySettings.updatedBy
      await tx.securitySettings.updateMany({
        where: { updatedBy: id },
        data: { updatedBy: replacementUserId }
      });

      // Update Settings.updatedBy
      await tx.settings.updateMany({
        where: { updatedBy: id },
        data: { updatedBy: replacementUserId }
      });

      // Update CardRegistration.updatedBy (set to null vì nullable)
      await tx.cardRegistration.updateMany({
        where: { updatedBy: id },
        data: { updatedBy: null }
      });

      // Update RoomBooking.updatedBy (set to null vì nullable)
      await tx.roomBooking.updateMany({
        where: { updatedBy: id },
        data: { updatedBy: null }
      });

      // Update Books.createdBy and updatedBy
      await tx.book.updateMany({
        where: { createdBy: id },
        data: { createdBy: replacementUserId }
      });

      await tx.book.updateMany({
        where: { updatedBy: id },
        data: { updatedBy: null }
      });

      // Update Events.createdBy and updatedBy
      await tx.event.updateMany({
        where: { createdBy: id },
        data: { createdBy: replacementUserId }
      });

      await tx.event.updateMany({
        where: { updatedBy: id },
        data: { updatedBy: null }
      });

      // Cuối cùng xóa user (CASCADE sẽ tự động xóa posts, media, sessions, api keys)
      await tx.user.delete({
        where: { id }
      });
    });

    return NextResponse.json({
      message: 'Xóa user thành công'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    
    // Trả về error message cụ thể nếu có
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi xóa user';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: error instanceof Error && error.message.includes('Không') ? 400 : 500 }
    );
  }
}