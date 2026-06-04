'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Eye, MessageCircle, Search, Newspaper, Clock, Loader2 } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  publishDate?: string;
  viewCount: number;
  author: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
    color?: string;
  } | null;
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

interface PostsResponse {
  success: boolean;
  data: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  color?: string;
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCategories(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Fetch posts
  const fetchPosts = async (page: number = 1) => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        status: 'published', // Only show published posts
        ...(searchQuery && { search: searchQuery }),
        ...(selectedCategory && selectedCategory !== 'all' && { category: selectedCategory })
      });

      const response = await fetch(`/api/posts/public?${params}`);
      
      if (!response.ok) {
        throw new Error('Lỗi khi tải danh sách bài viết');
      }

      const data: PostsResponse = await response.json();
      
      if (data.success) {
        let sortedPosts = [...data.data];
        
        // Sort posts based on sortBy
        sortedPosts.sort((a, b) => {
          switch (sortBy) {
            case 'title':
              return a.title.localeCompare(b.title);
            case 'viewCount':
              return b.viewCount - a.viewCount;
            case 'createdAt':
            default:
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
        });
        
        setPosts(sortedPosts);
        setPagination(data.pagination);
        setCurrentPage(page);
      } else {
        setError('Lỗi khi tải danh sách bài viết');
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err instanceof Error ? err.message : 'Lỗi khi tải danh sách bài viết');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchPosts(1);
  }, [searchQuery, selectedCategory, sortBy]);

  const handlePageChange = (page: number) => {
    fetchPosts(page);
  };

  const filteredAndSortedNews = posts;

  const getCategoryColor = (category: Category | null) => {
    if (!category) return 'bg-gray-100 text-gray-800';
    
    // Use category color if available
    if (category.color) {
      return category.color;
    }
    
    // Default colors based on category slug
    const colorMap: { [key: string]: string } = {
      'trending-now': 'bg-purple-100 text-purple-800',
      'sounds': 'bg-blue-100 text-blue-800',
      'challenges': 'bg-orange-100 text-orange-800',
      'celebrities': 'bg-pink-100 text-pink-800',
      'top-lists': 'bg-indigo-100 text-indigo-800',
      'filters': 'bg-teal-100 text-teal-800',
      'social-media': 'bg-green-100 text-green-800',
      'guidelines': 'bg-yellow-100 text-yellow-800',
      'news': 'bg-red-100 text-red-800',
      'events': 'bg-green-100 text-green-800',
      'technology': 'bg-blue-100 text-blue-800',
      'training': 'bg-purple-100 text-purple-800',
      'announcement': 'bg-red-100 text-red-800',
      'activities': 'bg-yellow-100 text-yellow-800'
    };
    
    return colorMap[category.slug] || 'bg-gray-100 text-gray-800';
  };

  const featuredNews = filteredAndSortedNews.slice(0, 1)[0];
  const regularNews = filteredAndSortedNews.slice(1);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 

      

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex">
              <div className="text-red-800">
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            <span className="ml-2 text-gray-500">Đang tải tin tức...</span>
          </div>
        )}

        {/* Featured News */}
        {!loading && featuredNews && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Tin nổi bật</h2>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="md:flex">
                <div className="md:w-1/2 bg-gray-200 h-64 md:h-auto">
                  {featuredNews.featuredImage ? (
                    <img 
                      src={featuredNews.featuredImage} 
                      alt={featuredNews.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Newspaper className="h-16 w-16 text-white opacity-50" />
                    </div>
                  )}
                </div>
                <div className="md:w-1/2 p-6">
                  <div className="flex items-center mb-3">
                    {featuredNews.category && (
                      <Badge className={getCategoryColor(featuredNews.category)}>
                        {featuredNews.category.name}
                      </Badge>
                    )}
                    <div className={`${featuredNews.category ? 'ml-auto' : ''} flex items-center text-sm text-gray-500 space-x-4`}>
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {featuredNews.viewCount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    <Link href={`/post/${featuredNews.slug}`} className="hover:text-blue-600 transition-colors">
                      {featuredNews.title}
                    </Link>
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {featuredNews.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="h-4 w-4 mr-1" />
                      <span className="mr-4">{featuredNews.author.name}</span>
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{new Date(featuredNews.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    
                    <Button asChild>
                      <Link href={`/post/${featuredNews.slug}`}>
                        Đọc tiếp
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Regular News Grid */}
        {!loading && regularNews.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Tin tức khác</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.isArray(regularNews) && regularNews.map((news) => (
                <Card key={news.id} className="hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                    {news.featuredImage ? (
                      <img 
                        src={news.featuredImage} 
                        alt={news.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Newspaper className="h-8 w-8 text-gray-500 opacity-50" />
                    )}
                  </div>
                  
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      {news.category && (
                        <Badge className={getCategoryColor(news.category)}>
                          {news.category.name}
                        </Badge>
                      )}
                      <div className={`${news.category ? '' : 'ml-0'} flex items-center text-xs text-gray-500`}>
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(news.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                    
                    <CardTitle className="text-lg line-clamp-2">
                      <Link href={`/post/${news.slug}`} className="hover:text-blue-600 transition-colors">
                        {news.title}
                      </Link>
                    </CardTitle>
                    
                    <CardDescription className="line-clamp-3">
                      {news.excerpt}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {news.author.name}
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          {news.viewCount}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {Array.isArray(news.tags) && news.tags.slice(0, 3).map(tag => (
                        <Badge key={tag.id || tag.name || Math.random()} variant="outline" className="text-xs">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                    
                    <Button variant="outline" size="sm" asChild className="w-full">
                      <Link href={`/post/${news.slug}`}>
                        Chi tiết
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredAndSortedNews.length === 0 && (
          <div className="text-center py-12">
            <Newspaper className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy tin tức</h3>
            <p className="text-gray-600">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mb-8">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.hasPrev}
            >
              Trước
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, pagination.totalPages || 0) }, (_, i) => {
                const pageNum = Math.max(1, Math.min((pagination.totalPages || 1) - 4, (currentPage || 1) - 2)) + i;
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.hasNext}
            >
              Sau
            </Button>
          </div>
        )}

      
      </div>
    </div>
  );
}