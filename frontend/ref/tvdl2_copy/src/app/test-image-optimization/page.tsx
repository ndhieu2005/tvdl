import React from 'react';
import SmartImage from '@/components/SmartImage';
import OptimizedPostContent from '@/components/OptimizedPostContent';
import PostCard from '@/components/PostCard';

const TestImageOptimizationPage = () => {
  // Sample HTML content with images
  const sampleContent = `
    <h2>Tối ưu hóa hình ảnh trong Next.js</h2>
    <p>Đây là ví dụ về cách tối ưu hóa hình ảnh trong nội dung bài viết.</p>
    
    <img src="/api/public/media/sample-image-1" alt="Ảnh mẫu 1" width="800" height="450" />
    
    <p>Hình ảnh trên sẽ được tự động tối ưu hóa với:</p>
    <ul>
      <li>Loading lazy</li>
      <li>Sizes attribute phù hợp</li>
      <li>Responsive classes</li>
    </ul>
    
    <img src="/api/public/media/sample-image-2" alt="Ảnh mẫu 2" width="600" height="400" />
    
    <p>Tất cả hình ảnh sẽ được xử lý tự động để tối ưu hiệu suất.</p>
  `;

  // Sample post data
  const samplePost = {
    slug: 'test-post',
    title: 'Test Post với SmartImage',
    excerpt: 'Đây là bài viết test để demo tính năng tối ưu hóa hình ảnh',
    featuredImage: '/api/public/media/sample-featured',
    publishedAt: new Date().toISOString(),
    category: 'TRENDING_NOW',
    readingTime: 5,
    tags: ['test', 'optimization'],
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Test Image Optimization</h1>
      
      {/* Test SmartImage với các preset khác nhau */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">SmartImage với Presets</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Hero preset */}
          <div className="space-y-2">
            <h3 className="font-medium">Hero Preset</h3>
            <div className="aspect-video">
              <SmartImage
                src="/api/public/media/sample-hero"
                alt="Hero image"
                preset="hero"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>
          
          {/* Featured preset */}
          <div className="space-y-2">
            <h3 className="font-medium">Featured Preset</h3>
            <div className="aspect-video">
              <SmartImage
                src="/api/public/media/sample-featured"
                alt="Featured image"
                preset="featured"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>
          
          {/* Card preset */}
          <div className="space-y-2">
            <h3 className="font-medium">Card Preset</h3>
            <div className="aspect-video">
              <SmartImage
                src="/api/public/media/sample-card"
                alt="Card image"
                preset="card"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>
          
          {/* Thumbnail preset */}
          <div className="space-y-2">
            <h3 className="font-medium">Thumbnail Preset</h3>
            <div className="w-32 h-32">
              <SmartImage
                src="/api/public/media/sample-thumb"
                alt="Thumbnail image"
                preset="thumbnail"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>
          
          {/* Avatar preset */}
          <div className="space-y-2">
            <h3 className="font-medium">Avatar Preset</h3>
            <div className="w-20 h-20">
              <SmartImage
                src="/api/public/media/sample-avatar"
                alt="Avatar image"
                preset="avatar"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>
          
          {/* Logo preset */}
          <div className="space-y-2">
            <h3 className="font-medium">Logo Preset</h3>
            <div className="w-48 h-16">
              <SmartImage
                src="/api/public/media/sample-logo"
                alt="Logo image"
                preset="logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Test OptimizedPostContent */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Optimized Post Content</h2>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <OptimizedPostContent
            content={sampleContent}
            preloadImages={true}
          />
        </div>
      </section>
      
      {/* Test PostCard variants */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">PostCard Variants</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Default variant */}
          <div className="space-y-2">
            <h3 className="font-medium">Default Variant</h3>
            <PostCard post={samplePost} variant="default" />
          </div>
          
          {/* Optimized variant */}
          <div className="space-y-2">
            <h3 className="font-medium">Optimized Variant (SmartImage)</h3>
            <PostCard post={samplePost} variant="optimized" />
          </div>
          
          {/* Compact variant */}
          <div className="space-y-2">
            <h3 className="font-medium">Compact Variant</h3>
            <PostCard post={samplePost} variant="compact" />
          </div>
        </div>
      </section>
      
      {/* Performance Tips */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Performance Tips</h2>
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold mb-4">Các tối ưu hóa đã được áp dụng:</h3>
          <ul className="space-y-2 text-sm">
            <li>✅ <strong>Smart Sizes:</strong> Tự động tính toán sizes attribute dựa trên kích thước ảnh</li>
            <li>✅ <strong>Lazy Loading:</strong> Ảnh chỉ tải khi cần thiết</li>
            <li>✅ <strong>WebP Support:</strong> Tự động chuyển đổi sang WebP nếu browser hỗ trợ</li>
            <li>✅ <strong>Blur Placeholder:</strong> Hiển thị placeholder mờ khi đang tải</li>
            <li>✅ <strong>Responsive Images:</strong> Tải ảnh phù hợp với kích thước màn hình</li>
            <li>✅ <strong>Priority Loading:</strong> Ảnh quan trọng được tải trước</li>
            <li>✅ <strong>Content Optimization:</strong> Tự động tối ưu ảnh trong HTML content</li>
            <li>✅ <strong>Presets:</strong> Cấu hình sẵn cho các loại ảnh khác nhau</li>
          </ul>
        </div>
      </section>
      
      {/* Usage Examples */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Cách sử dụng</h2>
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold mb-4">1. SmartImage với preset:</h3>
          <pre className="bg-gray-800 text-white p-4 rounded text-sm overflow-x-auto mb-4">
{`<SmartImage
  src="/api/media/abc123"
  alt="Hình ảnh"
  preset="card"
  className="w-full h-full object-cover"
/>`}
          </pre>
          
          <h3 className="font-semibold mb-4">2. SmartImage với kích thước tùy chỉnh:</h3>
          <pre className="bg-gray-800 text-white p-4 rounded text-sm overflow-x-auto mb-4">
{`<SmartImage
  src="/api/media/abc123"
  alt="Hình ảnh"
  width={800}
  height={450}
  quality={85}
  priority={false}
/>`}
          </pre>
          
          <h3 className="font-semibold mb-4">3. OptimizedPostContent:</h3>
          <pre className="bg-gray-800 text-white p-4 rounded text-sm overflow-x-auto">
{`<OptimizedPostContent
  content={post.content}
  preloadImages={true}
  className="prose max-w-none"
/>`}
          </pre>
        </div>
      </section>
    </div>
  );
};

export default TestImageOptimizationPage;