import { NextRequest, NextResponse } from 'next/server';
import { initAdminUser, getAdminUserInfo } from '@/lib/init-admin';

/**
 * @swagger
 * /api/admin/auto-init:
 *   get:
 *     summary: Get current admin user information
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Admin user information
 *       404:
 *         description: Admin user not found
 */
export async function GET(req: NextRequest) {
  try {
    console.log('🔍 [API] Checking admin user info...');
    
    const adminInfo = await getAdminUserInfo();
    
    if (!adminInfo) {
      console.log('⚠️  [API] No admin user found');
      return NextResponse.json(
        { 
          error: 'Không tìm thấy admin user',
          adminExists: false 
        },
        { status: 404 }
      );
    }
    
    console.log('✅ [API] Admin user found:', adminInfo.email);
    return NextResponse.json({
      message: 'Admin user đã tồn tại',
      adminExists: true,
      user: adminInfo
    });
    
  } catch (error) {
    console.error('❌ [API] Error in GET admin info:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi kiểm tra admin user' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/admin/auto-init:
 *   post:
 *     summary: Auto initialize admin user (if not exists)
 *     tags: [Admin]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Admin name (default - Admin ViralPeek)
 *               email:
 *                 type: string
 *                 description: Admin email (default - admin@trendiefox.com)
 *               password:
 *                 type: string
 *                 description: Admin password (default - admin123456)
 *     responses:
 *       200:
 *         description: Admin user exists or created successfully
 *       500:
 *         description: Server error
 */
export async function POST(req: NextRequest) {
  try {
    console.log('🚀 [API] Auto-init admin user requested...');
    
    // Parse request body (optional)
    let customConfig = null;
    try {
      const body = await req.json();
      if (body.name || body.email || body.password) {
        customConfig = {
          name: body.name || "Admin ViralPeek",
          email: body.email || "admin@trendiefox.com",
          password: body.password || "admin123456"
        };
        console.log('📝 [API] Using custom admin config:', {
          name: customConfig.name,
          email: customConfig.email,
          password: '****** (hidden)'
        });
      }
    } catch (e) {
      console.log('📝 [API] No custom config provided, using defaults');
    }
    
    // Initialize admin user
    const adminUser = await initAdminUser(customConfig || undefined);
    
    // Return user info without password
    const { password, ...userWithoutPassword } = adminUser;
    
    console.log('✅ [API] Admin auto-init completed successfully');
    return NextResponse.json({
      message: 'Admin user đã được khởi tạo thành công',
      user: userWithoutPassword,
      isNewUser: !adminUser.createdAt || 
                 (Date.now() - adminUser.createdAt.getTime()) < 5000 // Created in last 5 seconds
    });
    
  } catch (error) {
    console.error('❌ [API] Error in admin auto-init:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi khởi tạo admin user' },
      { status: 500 }
    );
  }
}