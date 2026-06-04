import { notFound } from 'next/navigation';

const mockPost = {
  title: 'Test Post from Browser',
  content: 'This is a test post created from browser to test the posting functionality.',
  excerpt: 'A test post created from browser to verify post display functionality',
  category: 'Test',
  author: 'Test User',
  publishedAt: '2024-01-17T10:00:00Z',
  views: 1,
  tags: ['test', 'browser', 'functionality']
};

export default async function PostPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  // Await the params since it's now a Promise in Next.js 15
  const { slug } = await params;
  
  // For testing, we'll just show content for any slug
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">
        {mockPost.title}
      </h1>
      
      <div className="mb-6">
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded">
          {mockPost.category}
        </span>
      </div>
      
      <p className="text-gray-600 mb-6">
        {mockPost.excerpt}
      </p>
      
      <div className="mb-8">
        <p>By {mockPost.author}</p>
        <p>{mockPost.views} views</p>
      </div>
      
      <div className="prose max-w-none">
        <p>{mockPost.content}</p>
      </div>
      
      <div className="mt-8">
        <h3 className="font-semibold mb-2">Tags</h3>
        <div className="flex gap-2">
          {mockPost.tags.map(tag => (
            <span key={tag} className="bg-gray-100 px-2 py-1 rounded">
              #{tag}
            </span>
          ))}
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-green-100 rounded">
        <p>✅ If you can see this, the post page is working!</p>
        <p>URL slug: {slug}</p>
      </div>
    </div>
  );
}