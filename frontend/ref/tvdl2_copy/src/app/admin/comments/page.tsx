'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  MessageCircle, 
  User, 
  ExternalLink,
  Check,
  X,
  Trash2,
  Flag,
  Reply,
  MoreHorizontal,
  Clock,
  Eye,
  AlertTriangle,
  UserX,
  Calendar,
  Hash
} from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  author: {
    name: string;
    email: string;
    avatar?: string;
    ip: string;
  };
  post: {
    id: string;
    title: string;
    type: 'post' | 'video';
    slug: string;
  };
  status: 'pending' | 'approved' | 'spam' | 'trash';
  createdAt: string;
  parentId?: string;
  replies?: Comment[];
  isRead: boolean;
}

// Mock data
const mockComments: Comment[] = [
  {
    id: '1',
    content: 'Video này hay quá! Mình đã thử theo hướng dẫn và thành công rồi. Cảm ơn admin đã chia sẻ 😍',
    author: {
      name: 'Nguyễn Thị Mai',
      email: 'mai.nguyen@gmail.com',
      avatar: '',
      ip: '192.168.1.100'
    },
    post: {
      id: '1',
      title: 'Dance Challenge Viral TikTok 2024',
      type: 'video',
      slug: 'dance-challenge-viral-tiktok-2024'
    },
    status: 'pending',
    createdAt: '2024-01-20T14:30:00Z',
    isRead: false
  },
  {
    id: '2', 
    content: 'Cho mình hỏi làm sao để tạo hiệu ứng như trong video được không ạ?',
    author: {
      name: 'Trần Văn Hùng',
      email: 'hung.tran@yahoo.com',
      avatar: '',
      ip: '192.168.1.101'
    },
    post: {
      id: '2',
      title: 'Top 10 TikTok Trends This Week',
      type: 'post',
      slug: 'top-10-tiktok-trends-this-week'
    },
    status: 'approved',
    createdAt: '2024-01-20T13:15:00Z',
    isRead: true
  },
  {
    id: '3',
    content: 'Buy cheap followers! Click here for amazing deals!!! 🔥💰',
    author: {
      name: 'SpamBot123',
      email: 'spam@fake.com',
      avatar: '',
      ip: '123.456.789.0'
    },
    post: {
      id: '3',
      title: 'Beauty Transformation Tutorial',
      type: 'video',
      slug: 'beauty-transformation-tutorial'
    },
    status: 'spam',
    createdAt: '2024-01-20T12:45:00Z',
    isRead: true
  },
  {
    id: '4',
    content: 'Bài viết rất hữu ích! Mình đã share cho bạn bè rồi. Thanks bạn!',
    author: {
      name: 'Lê Thị Hoa',
      email: 'hoa.le@hotmail.com',
      avatar: '',
      ip: '192.168.1.102'
    },
    post: {
      id: '4',
      title: 'Food Trend Challenge 2024',
      type: 'post',
      slug: 'food-trend-challenge-2024'
    },
    status: 'approved',
    createdAt: '2024-01-20T11:20:00Z',
    isRead: true
  },
  {
    id: '5',
    content: 'Website này toàn content rác! Không nên tin những thông tin này.',
    author: {
      name: 'Hater Anonymous',
      email: 'hate@negative.com',
      avatar: '',
      ip: '111.222.333.444'
    },
    post: {
      id: '1',
      title: 'Dance Challenge Viral TikTok 2024',
      type: 'video', 
      slug: 'dance-challenge-viral-tiktok-2024'
    },
    status: 'trash',
    createdAt: '2024-01-20T10:30:00Z',
    isRead: true
  },
  {
    id: '6',
    content: 'Mình có thể dùng bài hát này cho video của mình được không?',
    author: {
      name: 'Phạm Minh Tú',
      email: 'tu.pham@gmail.com',
      avatar: '',
      ip: '192.168.1.103'
    },
    post: {
      id: '5',
      title: 'Top Trending Songs on TikTok',
      type: 'post',
      slug: 'top-trending-songs-tiktok'
    },
    status: 'pending',
    createdAt: '2024-01-20T09:45:00Z',
    isRead: false
  }
];

export default function CommentsManagementPage() {
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedComments, setSelectedComments] = useState<string[]>([]);
  const [showReplyModal, setShowReplyModal] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [bulkAction, setBulkAction] = useState<string>('');

  // Filter comments
  const filteredComments = comments.filter(comment => {
    const matchesSearch = comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comment.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comment.post.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || comment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'spam':
        return 'bg-red-100 text-red-800';
      case 'trash':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-3 w-3" />;
      case 'approved':
        return <Check className="h-3 w-3" />;
      case 'spam':
        return <Flag className="h-3 w-3" />;
      case 'trash':
        return <Trash2 className="h-3 w-3" />;
      default:
        return <MessageCircle className="h-3 w-3" />;
    }
  };

  // Toggle comment selection
  const toggleCommentSelection = (commentId: string) => {
    setSelectedComments(prev => 
      prev.includes(commentId) 
        ? prev.filter(id => id !== commentId)
        : [...prev, commentId]
    );
  };

  // Update comment status
  const updateCommentStatus = (commentId: string, newStatus: Comment['status']) => {
    setComments(prev => prev.map(comment =>
      comment.id === commentId 
        ? { ...comment, status: newStatus, isRead: true }
        : comment
    ));
  };

  // Handle bulk actions
  const handleBulkAction = () => {
    if (!bulkAction || selectedComments.length === 0) return;

    setComments(prev => prev.map(comment =>
      selectedComments.includes(comment.id)
        ? { ...comment, status: bulkAction as Comment['status'], isRead: true }
        : comment
    ));

    setSelectedComments([]);
    setBulkAction('');
  };

  // Handle reply
  const handleReply = (commentId: string) => {
    if (!replyContent.trim()) return;
    
    // In real app, this would send reply via API
    console.log('Reply to comment:', commentId, replyContent);
    
    setShowReplyModal(null);
    setReplyContent('');
  };

  // Delete comment
  const deleteComment = (commentId: string) => {
    setComments(prev => prev.filter(comment => comment.id !== commentId));
  };

  // Mark as read
  const markAsRead = (commentId: string) => {
    setComments(prev => prev.map(comment =>
      comment.id === commentId 
        ? { ...comment, isRead: true }
        : comment
    ));
  };

  // Statistics
  const totalComments = comments.length;
  const pendingComments = comments.filter(c => c.status === 'pending').length;
  const approvedComments = comments.filter(c => c.status === 'approved').length;
  const spamComments = comments.filter(c => c.status === 'spam').length;
  const unreadComments = comments.filter(c => !c.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý Comments
          </h1>
          <p className="text-gray-600 mt-1">
            Duyệt, trả lời và quản lý comments từ người dùng
          </p>
        </div>
        
        {unreadComments > 0 && (
          <div className="bg-red-100 text-red-800 px-3 py-2 rounded-lg flex items-center space-x-2">
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm font-medium">
              {unreadComments} comment chưa đọc
            </span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{totalComments}</h3>
              <p className="text-sm text-gray-500">Tổng comments</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{pendingComments}</h3>
              <p className="text-sm text-gray-500">Chờ duyệt</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{approvedComments}</h3>
              <p className="text-sm text-gray-500">Đã duyệt</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Flag className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{spamComments}</h3>
              <p className="text-sm text-gray-500">Spam</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Eye className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{unreadComments}</h3>
              <p className="text-sm text-gray-500">Chưa đọc</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm comments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64"
              />
            </div>
            
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="spam">Spam</option>
              <option value="trash">Thùng rác</option>
            </select>
          </div>
          
          {/* Bulk Actions */}
          {selectedComments.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                Đã chọn {selectedComments.length} comment
              </span>
              <select 
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Chọn thao tác</option>
                <option value="approved">Duyệt</option>
                <option value="spam">Đánh dấu spam</option>
                <option value="trash">Xóa</option>
              </select>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                Thực hiện
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comments List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="divide-y divide-gray-200">
          {filteredComments.map((comment) => (
            <div 
              key={comment.id} 
              className={`p-6 hover:bg-gray-50 transition-colors ${
                !comment.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex items-start space-x-4">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedComments.includes(comment.id)}
                  onChange={() => toggleCommentSelection(comment.id)}
                  className="mt-1 rounded border-gray-300"
                />
                
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {comment.author.avatar ? (
                    <img
                      src={comment.author.avatar}
                      alt={comment.author.name}
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {comment.author.name}
                      </h4>
                      <span className="text-sm text-gray-500">
                        {comment.author.email}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium space-x-1 ${getStatusColor(comment.status)}`}>
                        {getStatusIcon(comment.status)}
                        <span className="capitalize">{
                          comment.status === 'pending' ? 'Chờ duyệt' :
                          comment.status === 'approved' ? 'Đã duyệt' :
                          comment.status === 'spam' ? 'Spam' : 'Thùng rác'
                        }</span>
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(comment.createdAt).toLocaleString('vi-VN')}</span>
                    </div>
                  </div>

                  {/* Comment Content */}
                  <div className="mb-3">
                    <p className="text-gray-900 leading-relaxed">
                      {comment.content}
                    </p>
                  </div>

                  {/* Post Info */}
                  <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>Comment trên:</span>
                      <Link 
                        href={`/${comment.post.type}/${comment.post.slug}`}
                        className="text-purple-600 hover:text-purple-800 font-medium flex items-center space-x-1"
                      >
                        <span>{comment.post.title}</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        comment.post.type === 'video' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {comment.post.type === 'video' ? 'Video' : 'Bài viết'}
                      </span>
                    </div>
                  </div>

                  {/* Author Details */}
                  <div className="mb-4 text-xs text-gray-500 space-y-1">
                    <div>IP: {comment.author.ip}</div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-4">
                    {comment.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateCommentStatus(comment.id, 'approved')}
                          className="text-green-600 hover:text-green-800 flex items-center space-x-1 text-sm"
                        >
                          <Check className="h-4 w-4" />
                          <span>Duyệt</span>
                        </button>
                        <button
                          onClick={() => updateCommentStatus(comment.id, 'spam')}
                          className="text-red-600 hover:text-red-800 flex items-center space-x-1 text-sm"
                        >
                          <Flag className="h-4 w-4" />
                          <span>Spam</span>
                        </button>
                      </>
                    )}
                    
                    {comment.status === 'approved' && (
                      <button
                        onClick={() => setShowReplyModal(comment.id)}
                        className="text-blue-600 hover:text-blue-800 flex items-center space-x-1 text-sm"
                      >
                        <Reply className="h-4 w-4" />
                        <span>Trả lời</span>
                      </button>
                    )}
                    
                    {comment.status === 'spam' && (
                      <button
                        onClick={() => updateCommentStatus(comment.id, 'approved')}
                        className="text-green-600 hover:text-green-800 flex items-center space-x-1 text-sm"
                      >
                        <Check className="h-4 w-4" />
                        <span>Không phải spam</span>
                      </button>
                    )}

                    <button
                      onClick={() => deleteComment(comment.id)}
                      className="text-red-600 hover:text-red-800 flex items-center space-x-1 text-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Xóa</span>
                    </button>

                    {!comment.isRead && (
                      <button
                        onClick={() => markAsRead(comment.id)}
                        className="text-purple-600 hover:text-purple-800 flex items-center space-x-1 text-sm"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Đánh dấu đã đọc</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredComments.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không tìm thấy comment
            </h3>
            <p className="text-gray-500">
              Hãy thử thay đổi bộ lọc để xem comments khác.
            </p>
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {showReplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Trả lời comment
            </h3>
            
            {/* Original Comment */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="text-sm text-gray-600 mb-2">
                Comment gốc:
              </div>
              <p className="text-gray-900">
                {comments.find(c => c.id === showReplyModal)?.content}
              </p>
            </div>

            {/* Reply Input */}
            <div className="mb-4">
              <label htmlFor="reply" className="block text-sm font-medium text-gray-700 mb-2">
                Nội dung trả lời
              </label>
              <textarea
                id="reply"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Nhập nội dung trả lời..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowReplyModal(null);
                  setReplyContent('');
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => handleReply(showReplyModal)}
                disabled={!replyContent.trim()}
                className="flex-1 px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50"
              >
                Gửi trả lời
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}