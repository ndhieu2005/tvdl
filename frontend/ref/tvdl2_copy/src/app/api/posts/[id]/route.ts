import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withEditorAuth, withAdminAuth } from '@/lib/middleware/auth';

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Lấy một bài viết theo ID
 *     description: Lấy thông tin chi tiết của một bài viết theo ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bài viết
 *     responses:
 *       200:
 *         description: Thông tin bài viết được trả về thành công
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Post'
 *       400:
 *         description: ID không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Không tìm thấy bài viết
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const GET = withEditorAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const user = (request as any).user;

    console.log('🔍 GET /api/posts/[id] - Post ID:', id);
    console.log('🔍 GET /api/posts/[id] - User:', user);

    // Build query based on user role
    let whereClause: any = { id };
    
    if (user.role === 'EDITOR') {
      // Editor can only see their own posts
      whereClause.authorId = user.userId;
    } else if (user.role === 'ADMIN') {
      // Admin can see all posts from editors and other admins
      whereClause.author = {
        role: {
          in: ['ADMIN', 'EDITOR']
        }
      };
    }

    const post = await prisma.post.findFirst({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        postTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        }
      }
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    console.log('🔍 GET /api/posts/[id] - Post found:', post.title);

    // Transform data for frontend
    const transformedPost = {
      ...post,
      // Keep category as object for display
      category: post.category ? {
        id: post.category.id,
        name: post.category.name,
        slug: post.category.slug
      } : null,
      // Add categorySlug for frontend dropdown selection
      categorySlug: post.category?.slug || '',
      // Transform tags from postTags relation to flat array
      tags: post.postTags?.map(pt => pt.tag) || [],
      // Remove postTags from response to avoid confusion
      postTags: undefined
    };

    return NextResponse.json({
      success: true,
      data: transformedPost
    });
  } catch (error) {
    console.error('🔍 GET /api/posts/[id] - Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
});

/**
 * @swagger
 * /api/posts/{id}:
 *   put:
 *     summary: Cập nhật bài viết
 *     description: Cập nhật thông tin của một bài viết theo ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bài viết
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PostInput'
 *     responses:
 *       200:
 *         description: Bài viết được cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Post'
 *       400:
 *         description: ID không hợp lệ hoặc dữ liệu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Không tìm thấy bài viết
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const PUT = withEditorAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const user = (request as any).user;
    const body = await request.json();

    console.log('🔍 PUT /api/posts/[id] - Post ID:', id);
    console.log('🔍 PUT /api/posts/[id] - User:', user);
    console.log('🔍 PUT /api/posts/[id] - Body:', body);

    // Build query based on user role
    let whereClause: any = { id };
    
    if (user.role === 'EDITOR') {
      // Editor can only update their own posts
      whereClause.authorId = user.userId;
    } else if (user.role === 'ADMIN') {
      // Admin can update all posts from editors and other admins
      whereClause.author = {
        role: {
          in: ['ADMIN', 'EDITOR']
        }
      };
    }

    // Check if post exists and user has permission
    const existingPost = await prisma.post.findFirst({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        postTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        }
      }
    });

    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: 'Post not found or you do not have permission to edit it' },
        { status: 404 }
      );
    }

    // Check if slug already exists (if changed)
    if (body.slug && body.slug !== existingPost.slug) {
      const slugExists = await prisma.post.findFirst({
        where: { 
          slug: body.slug,
          id: { not: id }
        }
      });
      
      if (slugExists) {
        return NextResponse.json(
          { success: false, error: 'Slug already exists' },
          { status: 400 }
        );
      }
    }

    // Handle status conversion
    let postStatus: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' = 'DRAFT';
    if (body.status) {
      const statusUpper = body.status.toUpperCase();
      if (statusUpper === 'DRAFT') {
        postStatus = 'DRAFT';
      } else if (statusUpper === 'PUBLISHED') {
        postStatus = 'PUBLISHED';
      } else if (statusUpper === 'SCHEDULED') {
        postStatus = 'SCHEDULED';
      }
    }

    // Handle category conversion
    let categoryId: string | undefined;
    if (body.category) {
      console.log('🔍 PUT /api/posts/[id] - Processing category:', body.category);
      
      // Normalize category slug
      const categorySlug = body.category.toLowerCase().replace(/_/g, '-');
      console.log('🔍 PUT /api/posts/[id] - Normalized category slug:', categorySlug);
      
      // Try to find category by slug, ID, or name in database
      const category = await prisma.category.findFirst({
        where: {
          OR: [
            { slug: categorySlug },
            { id: body.category },
            { name: body.category }
          ]
        }
      });
      
      if (category) {
        categoryId = category.id;
        console.log('🔍 PUT /api/posts/[id] - Found category:', { id: category.id, name: category.name, slug: category.slug });
      } else {
        console.warn('🔍 PUT /api/posts/[id] - Category not found:', body.category);
        // Don't fail the request, just log warning and continue without category
      }
    }

    // Handle tags processing
    let tagsToUpdate: string[] | undefined;
    let tagIds: string[] | undefined;
    
    // Check for tagIds first (from frontend)
    if (body.tagIds && Array.isArray(body.tagIds)) {
      tagIds = body.tagIds;
      
      // Get tag names from database for tags field
      if (tagIds && tagIds.length > 0) {
        const tags = await prisma.tag.findMany({
          where: { id: { in: tagIds } },
          select: { id: true, name: true }
        });
        tagsToUpdate = tags.map((tag: { id: string; name: string }) => tag.name);
      }
    }
    // Fallback to body.tags (legacy support)
    else if (body.tags) {
      if (Array.isArray(body.tags)) {
        // If tags is array of objects with id field
        if (body.tags.length > 0 && typeof body.tags[0] === 'object' && body.tags[0].id) {
          tagIds = body.tags.map((tag: any) => tag.id);
          tagsToUpdate = body.tags.map((tag: any) => tag.name || tag.slug);
        } 
        // If tags is array of strings (tag names)
        else if (body.tags.length > 0 && typeof body.tags[0] === 'string') {
          tagsToUpdate = body.tags as string[];
        }
      }
    }

    // Handle SEO fields from body.seo object
    let seoTitle = body.seoTitle || existingPost.seoTitle;
    let seoDescription = body.seoDescription || existingPost.seoDescription;
    let seoKeywords = existingPost.seoKeywords ?? null;
    
    // Check if SEO data is nested in body.seo
    if (body.seo && typeof body.seo === 'object') {
      seoTitle = body.seo.metaTitle || body.seo.seoTitle || seoTitle;
      seoDescription = body.seo.metaDescription || body.seo.seoDescription || seoDescription;
      if (body.seo.keywords) {
        if (typeof body.seo.keywords === 'string') {
          seoKeywords = body.seo.keywords.split(',').map((k: string) => k.trim()).filter((k: string) => k.length > 0);
        } else if (Array.isArray(body.seo.keywords)) {
          seoKeywords = body.seo.keywords;
        }
      }
      console.log('🔍 PUT /api/posts/[id] - SEO data from body.seo:', body.seo);
    }
    
    // Prepare update data
    const updateData: any = {
      title: body.title || existingPost.title,
      slug: body.slug || existingPost.slug,
      content: body.content || existingPost.content,
      excerpt: body.excerpt || existingPost.excerpt,
      status: postStatus,
      featuredImage: body.featuredImage !== undefined ? body.featuredImage : existingPost.featuredImage,
      seoTitle: seoTitle,
      seoDescription: seoDescription,
      seoKeywords: seoKeywords,
      // Video fields - only update if provided
      videoUrl: body.videoUrl !== undefined ? body.videoUrl : existingPost.videoUrl,
      videoThumbnail: body.videoThumbnail !== undefined ? body.videoThumbnail : existingPost.videoThumbnail,
      videoPlatform: body.videoPlatform !== undefined ? body.videoPlatform : existingPost.videoPlatform,
      videoTitle: body.videoTitle !== undefined ? body.videoTitle : existingPost.videoTitle,
      videoDescription: body.videoDescription !== undefined ? body.videoDescription : existingPost.videoDescription,
      videoMetadata: body.videoMetadata !== undefined ? body.videoMetadata : existingPost.videoMetadata,
      updatedAt: new Date()
    };
    
    console.log('🔍 PUT /api/posts/[id] - Update data prepared:', {
      title: updateData.title,
      slug: updateData.slug,
      status: updateData.status,
      categoryId: categoryId,
      seoTitle: updateData.seoTitle,
      seoDescription: updateData.seoDescription,
      seoKeywords: updateData.seoKeywords,
      tagsCount: tagsToUpdate?.length || 0,
      tagIdsCount: tagIds?.length || 0
    });

    // Add tags as comma-separated string if provided
    if (tagsToUpdate) {
      updateData.tags = tagsToUpdate.length > 0 ? tagsToUpdate.join(', ') : null;
    }

    // Add categoryId if provided
    if (categoryId) {
      updateData.categoryId = categoryId;
    }

    // Handle publish date
    if (postStatus === 'PUBLISHED' && !existingPost.publishDate) {
      updateData.publishDate = new Date();
    } else if (postStatus === 'SCHEDULED' && body.publishDate) {
      updateData.publishDate = new Date(body.publishDate);
    } else if (body.publishDate) {
      // Handle direct publishDate update
      updateData.publishDate = new Date(body.publishDate);
    }
    
    console.log('🔍 PUT /api/posts/[id] - Publish date handling:', {
      postStatus,
      bodyPublishDate: body.publishDate,
      existingPublishDate: existingPost.publishDate,
      newPublishDate: updateData.publishDate
    });

    // Update post
    let updatedPost;
    try {
      updatedPost = await prisma.post.update({
        where: { id },
        data: updateData,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          postTags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  slug: true
                }
              }
            }
          }
        }
      });
    } catch (updateError) {
      console.error('🔍 PUT /api/posts/[id] - Post update error:', updateError);
      console.error('🔍 PUT /api/posts/[id] - Update data that failed:', updateData);
      throw updateError;
    }

    console.log('🔍 PUT /api/posts/[id] - Post updated:', updatedPost.title);

    // Update postTags relation if tagIds provided
    if (tagIds && tagIds.length > 0) {
      // Remove existing postTags
      await prisma.postTag.deleteMany({
        where: { postId: id }
      });
      
      // Add new postTags
      await prisma.postTag.createMany({
        data: tagIds.map(tagId => ({
          postId: id,
          tagId: tagId
        }))
      });
      
      console.log('🔍 PUT /api/posts/[id] - PostTags updated:', tagIds.length);
    }

    // Get updated post with new relations
    const finalPost = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        postTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        }
      }
    });

    // Transform data for frontend
    const transformedUpdatedPost = {
      ...finalPost,
      // Keep category as object for display
      category: finalPost?.category ? {
        id: finalPost.category.id,
        name: finalPost.category.name,
        slug: finalPost.category.slug
      } : null,
      // Add categorySlug for frontend dropdown selection
      categorySlug: finalPost?.category?.slug || '',
      // Transform tags from postTags relation to flat array
      tags: finalPost?.postTags?.map(pt => pt.tag) || [],
      // Remove postTags from response to avoid confusion
      postTags: undefined
    };

    return NextResponse.json({
      success: true,
      data: transformedUpdatedPost,
      message: 'Post updated successfully'
    });
  } catch (error) {
    console.error('🔍 PUT /api/posts/[id] - Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update post' },
      { status: 500 }
    );
  }
});

/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: Xóa bài viết
 *     description: Xóa một bài viết theo ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bài viết cần xóa
 *     responses:
 *       200:
 *         description: Bài viết được xóa thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: ID không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Không tìm thấy bài viết
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const DELETE = withEditorAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const user = (request as any).user;

    console.log('🗑️ DELETE /api/posts/[id] - Post ID:', id);
    console.log('🗑️ DELETE /api/posts/[id] - User:', user);
    console.log('🗑️ DELETE /api/posts/[id] - Request headers:', Object.fromEntries(request.headers.entries()));

    // Validate post ID
    if (!id || typeof id !== 'string') {
      console.error('🗑️ DELETE /api/posts/[id] - Invalid post ID:', id);
      return NextResponse.json(
        { success: false, error: 'Invalid post ID' },
        { status: 400 }
      );
    }

    // Build query based on user role
    let whereClause: any = { id };
    
    if (user.role === 'EDITOR') {
      // Editor can only delete their own posts
      whereClause.authorId = user.userId;
      console.log('🗑️ DELETE /api/posts/[id] - Editor can only delete own posts');
    } else if (user.role === 'ADMIN') {
      // Admin can delete all posts from editors and other admins
      whereClause.author = {
        role: {
          in: ['ADMIN', 'EDITOR']
        }
      };
      console.log('🗑️ DELETE /api/posts/[id] - Admin can delete all posts');
    }

    console.log('🗑️ DELETE /api/posts/[id] - Where clause:', whereClause);

    // Check if post exists and user has permission
    const existingPost = await prisma.post.findFirst({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    console.log('🗑️ DELETE /api/posts/[id] - Existing post:', existingPost ? {
      id: existingPost.id,
      title: existingPost.title,
      author: existingPost.author,
      category: existingPost.category
    } : null);

    if (!existingPost) {
      console.error('🗑️ DELETE /api/posts/[id] - Post not found or no permission');
      return NextResponse.json(
        { success: false, error: 'Post not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }

    // Delete post
    console.log('🗑️ DELETE /api/posts/[id] - Deleting post...');
    await prisma.post.delete({
      where: { id }
    });

    console.log('🗑️ DELETE /api/posts/[id] - Post deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('🗑️ DELETE /api/posts/[id] - Error:', error);
    
    // Log additional error details
    if (error instanceof Error) {
      console.error('🗑️ DELETE /api/posts/[id] - Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to delete post' },
      { status: 500 }
    );
  }
});