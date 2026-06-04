import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export interface AssignRoleRequest {
  role: 'ADMIN' | 'EDITOR' | 'USER';
  reason?: string;
}

// PATCH /api/users/[id]/role - Gán vai trò cho user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: AssignRoleRequest = await request.json();

    if (!body.role) {
      return NextResponse.json(
        { error: 'Vai trò là bắt buộc' },
        { status: 400 }
      );
    }

    // Chuyển đổi role thành chữ hoa để xử lý không phân biệt case
    const roleFromRequest = body.role.toUpperCase();

    if (!['ADMIN', 'EDITOR', 'USER'].includes(roleFromRequest)) {
      return NextResponse.json(
        { error: 'Vai trò không hợp lệ. Chỉ chấp nhận: ADMIN, EDITOR, USER' },
        { status: 400 }
      );
    }

    // Tìm user trong database
    const currentUser = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Không tìm thấy user' },
        { status: 404 }
      );
    }

    const oldRole = currentUser.role;
    const newRole = roleFromRequest as Role;

    // Kiểm tra nếu đang thay đổi từ admin sang role khác
    if (oldRole === Role.ADMIN && newRole !== Role.ADMIN) {
      const adminCount = await prisma.user.count({
        where: { role: Role.ADMIN }
      });
      
      if (adminCount === 1) {
        return NextResponse.json(
          { error: 'Không thể thay đổi vai trò của admin cuối cùng' },
          { status: 400 }
        );
      }
    }

    // Cập nhật vai trò trong database
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role: newRole }
    });

    // Log thay đổi vai trò (trong thực tế có thể lưu vào audit log)
    console.log(`Role changed for user ${id}: ${oldRole} -> ${newRole}`, {
      reason: body.reason,
      timestamp: new Date().toISOString()
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
      message: `Đã thay đổi vai trò từ ${oldRole} thành ${newRole}`,
      user: transformedUser,
      changes: {
        oldRole,
        newRole,
        reason: body.reason,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error assigning role:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi gán vai trò' },
      { status: 500 }
    );
  }
}