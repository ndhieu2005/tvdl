import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ViralPeek API',
      version: '1.0.0',
      description: 'API documentation for ViralPeek - Entertainment news website',
      contact: {
        name: 'ViralPeek Team',
        email: 'contact@trendiefox.com',
      },
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Post: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Post ID',
              example: '507f1f77bcf86cd799439011',
            },
            title: {
              type: 'string',
              description: 'Post title',
              example: 'Trending TikTok Dance Challenge',
            },
            slug: {
              type: 'string',
              description: 'URL-friendly version of title',
              example: 'trending-tiktok-dance-challenge',
            },
            content: {
              type: 'string',
              description: 'Post content in HTML format',
              example: '<p>This is the post content...</p>',
            },
            excerpt: {
              type: 'string',
              description: 'Short description of the post',
              example: 'A brief overview of the latest TikTok dance trend...',
            },
            featuredImage: {
              type: 'string',
              description: 'URL of the featured image',
              example: 'https://example.com/image.jpg',
            },
            category: {
              type: 'string',
              enum: ['trending-now', 'sounds', 'challenges', 'celebrities', 'top-lists', 'filters'],
              description: 'Post category',
              example: 'trending-now',
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Post tags',
              example: ['tiktok', 'dance', 'viral'],
            },
            status: {
              type: 'string',
              enum: ['draft', 'published', 'scheduled'],
              description: 'Post status',
              example: 'published',
            },
            publishDate: {
              type: 'string',
              format: 'date-time',
              description: 'Publication date',
              example: '2024-01-15T10:30:00Z',
            },
            views: {
              type: 'number',
              description: 'Number of views',
              example: 1250,
            },
            seo: {
              type: 'object',
              properties: {
                metaTitle: {
                  type: 'string',
                  description: 'SEO meta title',
                  example: 'Best TikTok Dance Challenge 2024',
                },
                metaDescription: {
                  type: 'string',
                  description: 'SEO meta description',
                  example: 'Discover the hottest TikTok dance challenge...',
                },
                keywords: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  description: 'SEO keywords',
                  example: ['tiktok', 'dance', 'viral', 'challenge'],
                },
              },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation date',
              example: '2024-01-15T10:30:00Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update date',
              example: '2024-01-15T12:45:00Z',
            },
          },
          required: ['title', 'content', 'slug', 'category', 'status'],
        },
        PostInput: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Post title',
              example: 'Trending TikTok Dance Challenge',
            },
            slug: {
              type: 'string',
              description: 'URL-friendly version of title',
              example: 'trending-tiktok-dance-challenge',
            },
            content: {
              type: 'string',
              description: 'Post content in HTML format',
              example: '<p>This is the post content...</p>',
            },
            excerpt: {
              type: 'string',
              description: 'Short description of the post',
              example: 'A brief overview of the latest TikTok dance trend...',
            },
            featuredImage: {
              type: 'string',
              description: 'URL of the featured image',
              example: 'https://example.com/image.jpg',
            },
            category: {
              type: 'string',
              enum: ['trending-now', 'sounds', 'challenges', 'celebrities', 'top-lists', 'filters'],
              description: 'Post category',
              example: 'trending-now',
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Post tags',
              example: ['tiktok', 'dance', 'viral'],
            },
            status: {
              type: 'string',
              enum: ['draft', 'published', 'scheduled'],
              description: 'Post status',
              example: 'published',
            },
            publishDate: {
              type: 'string',
              format: 'date-time',
              description: 'Publication date (required for scheduled posts)',
              example: '2024-01-15T10:30:00Z',
            },
            seo: {
              type: 'object',
              properties: {
                metaTitle: {
                  type: 'string',
                  description: 'SEO meta title',
                  example: 'Best TikTok Dance Challenge 2024',
                },
                metaDescription: {
                  type: 'string',
                  description: 'SEO meta description',
                  example: 'Discover the hottest TikTok dance challenge...',
                },
                keywords: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  description: 'SEO keywords',
                  example: ['tiktok', 'dance', 'viral', 'challenge'],
                },
              },
            },
          },
          required: ['title', 'content', 'category', 'status'],
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indicates if the request was successful',
              example: true,
            },
            data: {
              description: 'Response data',
            },
            message: {
              type: 'string',
              description: 'Response message',
              example: 'Operation completed successfully',
            },
            error: {
              type: 'string',
              description: 'Error message (only present when success is false)',
              example: 'An error occurred',
            },
          },
          required: ['success'],
        },
        PaginatedPostsResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Post',
              },
            },
            pagination: {
              type: 'object',
              properties: {
                page: {
                  type: 'number',
                  description: 'Current page number',
                  example: 1,
                },
                limit: {
                  type: 'number',
                  description: 'Number of items per page',
                  example: 10,
                },
                total: {
                  type: 'number',
                  description: 'Total number of items',
                  example: 50,
                },
                totalPages: {
                  type: 'number',
                  description: 'Total number of pages',
                  example: 5,
                },
                hasNext: {
                  type: 'boolean',
                  description: 'Whether there is a next page',
                  example: true,
                },
                hasPrev: {
                  type: 'boolean',
                  description: 'Whether there is a previous page',
                  example: false,
                },
              },
              required: ['page', 'limit', 'total', 'totalPages', 'hasNext', 'hasPrev'],
            },
          },
          required: ['success', 'data', 'pagination'],
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              description: 'Error message',
              example: 'An error occurred',
            },
          },
          required: ['success', 'error'],
        },
        Category: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Category ID',
              example: 'cmcvizg040000m2sb16nnxq04',
            },
            name: {
              type: 'string',
              description: 'Category name',
              example: 'Trending Now',
            },
            slug: {
              type: 'string',
              description: 'URL-friendly category slug',
              example: 'trending-now',
            },
            description: {
              type: 'string',
              description: 'Category description',
              example: 'Những xu hướng hot nhất hiện tại trên TikTok',
            },
            color: {
              type: 'string',
              description: 'Category color (hex code)',
              example: '#8B5CF6',
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive'],
              description: 'Category status',
              example: 'active',
            },
            metaTitle: {
              type: 'string',
              description: 'SEO meta title',
              example: 'Trending Now - Xu hướng TikTok mới nhất',
            },
            metaDescription: {
              type: 'string',
              description: 'SEO meta description',
              example: 'Khám phá những xu hướng TikTok hot nhất, viral content và những điều đang được quan tâm nhất hiện tại.',
            },
            featured: {
              type: 'boolean',
              description: 'Whether category is featured',
              example: true,
            },
            sortOrder: {
              type: 'integer',
              description: 'Sort order for display',
              example: 1,
            },
            postsCount: {
              type: 'integer',
              description: 'Number of posts in category',
              example: 0,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
              example: '2025-07-09T05:35:09.393Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
              example: '2025-07-09T05:35:09.393Z',
            },
          },
        },
        Tag: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Tag ID',
              example: 'cmcvizg040000m2sb16nnxq04',
            },
            name: {
              type: 'string',
              description: 'Tag name',
              example: 'TikTok',
            },
            slug: {
              type: 'string',
              description: 'URL-friendly tag slug',
              example: 'tiktok',
            },
            description: {
              type: 'string',
              description: 'Tag description',
              example: 'Tất cả về TikTok và xu hướng viral',
            },
            color: {
              type: 'string',
              description: 'Tag color (hex code)',
              example: '#8B5CF6',
            },
            featured: {
              type: 'boolean',
              description: 'Whether tag is featured',
              example: true,
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'INACTIVE'],
              description: 'Tag status',
              example: 'ACTIVE',
            },
            metaTitle: {
              type: 'string',
              description: 'SEO meta title',
              example: 'TikTok - Xu hướng viral mới nhất',
            },
            metaDescription: {
              type: 'string',
              description: 'SEO meta description',
              example: 'Khám phá những xu hướng TikTok hot nhất và viral content đang được quan tâm nhất.',
            },
            postCount: {
              type: 'integer',
              description: 'Number of posts with this tag',
              example: 25,
            },
            usageCount: {
              type: 'integer',
              description: 'Usage count for analytics',
              example: 150,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
              example: '2025-07-09T05:35:09.393Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
              example: '2025-07-09T05:35:09.393Z',
            },
            createdBy: {
              type: 'string',
              description: 'User ID who created the tag',
              example: 'user123',
            },
          },
        },
        TagInput: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Tag name',
              example: 'TikTok',
            },
            slug: {
              type: 'string',
              description: 'URL-friendly tag slug',
              example: 'tiktok',
            },
            description: {
              type: 'string',
              description: 'Tag description',
              example: 'Tất cả về TikTok và xu hướng viral',
            },
            color: {
              type: 'string',
              description: 'Tag color (hex code)',
              example: '#8B5CF6',
            },
            featured: {
              type: 'boolean',
              description: 'Whether tag is featured',
              example: true,
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'INACTIVE'],
              description: 'Tag status',
              example: 'ACTIVE',
            },
            metaTitle: {
              type: 'string',
              description: 'SEO meta title',
              example: 'TikTok - Xu hướng viral mới nhất',
            },
            metaDescription: {
              type: 'string',
              description: 'SEO meta description',
              example: 'Khám phá những xu hướng TikTok hot nhất và viral content đang được quan tâm nhất.',
            },
          },
          required: ['name', 'slug'],
        },
      },
    },
  },
  apis: ['./src/app/api/**/*.ts'], // Path to the API files
};

const specs = swaggerJSDoc(options);
export default specs;