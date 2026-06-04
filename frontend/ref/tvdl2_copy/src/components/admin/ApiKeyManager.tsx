'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Key, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Copy,
  Check,
  X,
  Calendar,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Shield
} from 'lucide-react';
import { ApiKeyData, API_KEY_PERMISSIONS, API_KEY_CATEGORIES, CreateApiKeyRequest, UpdateApiKeyRequest } from '@/types/api-key';
import { useAuth } from '@/contexts/AuthContext';

interface ApiKeyManagerProps {
  onSave?: (data: any) => void;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ onSave }) => {
  const { token, loading: authLoading } = useAuth();
  
  // Utility function to get current token
  const getCurrentToken = () => {
    const currentToken = token || localStorage.getItem('token');
    console.log('🔍 getCurrentToken:', currentToken ? 'exists' : 'missing');
    if (currentToken) {
      console.log('🔍 Token details:', {
        length: currentToken.length,
        starts: currentToken.substring(0, 10),
        ends: currentToken.substring(currentToken.length - 10),
        isApiKey: currentToken.startsWith('vpk_'),
        isJWT: currentToken.includes('.')
      });
    }
    
    // Debug: Check all localStorage keys
    console.log('🔍 All localStorage keys:', Object.keys(localStorage));
    console.log('🔍 localStorage token:', localStorage.getItem('token')?.substring(0, 20));
    console.log('🔍 AuthContext token:', token?.substring(0, 20));
    
    // Warning if API key is stored in localStorage
    if (currentToken && currentToken.startsWith('vpk_')) {
      console.error('🚨 API Key found in localStorage! This should not happen.');
      console.error('🚨 This means API key was saved instead of JWT token.');
      console.error('🚨 Current token:', currentToken);
      // Don't auto-redirect, just log the issue
      alert('⚠️ Phát hiện lỗi: API Key đã được lưu thay vì JWT token. Vui lòng đăng nhập lại.');
    }
    
    return currentToken;
  };
  const [apiKeys, setApiKeys] = useState<ApiKeyData[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState<ApiKeyData | null>(null);
  const [showKeyValues, setShowKeyValues] = useState<{ [key: string]: boolean }>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);

  // Test token validity
  const testToken = async () => {
    const currentToken = getCurrentToken();
    if (!currentToken) {
      console.log('🔍 No token to test');
      return;
    }
    
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${currentToken}`,
        },
      });
      
      console.log('🔍 Token test response:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Token test success:', data.user);
      } else {
        console.log('🔍 Token test failed');
      }
    } catch (error) {
      console.log('🔍 Token test error:', error);
    }
  };

  // Fetch API keys from server
  useEffect(() => {
    console.log('🔍 ApiKeyManager: Auth state:', { authLoading, token: token ? 'exists' : 'missing' });
    if (!authLoading && token) {
      testToken(); // Test token first
      fetchApiKeys();
    }
  }, [token, authLoading]);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      
      const currentToken = getCurrentToken();
      if (!currentToken) {
        console.error('No admin token found');
        return;
      }

      const response = await fetch('/api/admin/api-keys', {
        headers: {
          'Authorization': `Bearer ${currentToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Convert server data to client format
        const convertedKeys: ApiKeyData[] = data.apiKeys.map((key: any) => ({
          id: key.id,
          userId: key.userId || 'admin',
          key: key.keyHash || 'hidden', // Server doesn't return actual key for security
          name: key.name,
          permissions: key.permissions?.map((p: any) => `${p.resource}:${p.action}`) || [],
          status: key.isActive ? 'active' : 'revoked',
          createdAt: new Date(key.createdAt),
          expiresAt: key.expiresAt ? new Date(key.expiresAt) : null,
          lastUsed: key.lastUsed ? new Date(key.lastUsed) : null,
          requestCount: key.usageCount || 0,
          description: key.description || ''
        }));
        setApiKeys(convertedKeys);
      } else {
        console.error('Failed to fetch API keys:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async (data: CreateApiKeyRequest) => {
    try {
      setLoading(true);
      const currentToken = getCurrentToken();
      console.log('🔑 Final token to use:', currentToken ? 'exists' : 'missing');
      
      if (!currentToken) {
        alert('Phiên đăng nhập đã hết hạn');
        return;
      }

      // Convert permissions to server format
      const permissions = data.permissions.map(perm => {
        const [resource, action] = perm.split(':');
        return { resource, action };
      });

      const response = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          permissions,
          expiresAt: data.expiresAt?.toISOString(),
          description: data.description,
          rateLimit: 1000, // Default rate limit
          ipWhitelist: []
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Show the new API key to user (only time they'll see it)
        setNewApiKey(result.apiKey);
        
        // Refresh the list
        await fetchApiKeys();
        setShowCreateModal(false);
        onSave && onSave({ type: 'create', data: result.keyInfo });
      } else {
        const error = await response.json();
        alert(`Lỗi tạo API Key: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating API key:', error);
      alert('Có lỗi xảy ra khi tạo API Key');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateKey = async (data: UpdateApiKeyRequest) => {
    if (!selectedKey) return;
    
    try {
      setLoading(true);
      
      const currentToken = token || localStorage.getItem('token');
      if (!currentToken) {
        alert('Phiên đăng nhập đã hết hạn');
        return;
      }

      const updateData: any = {
        name: data.name,
        isActive: data.status === 'active',
        expiresAt: data.expiresAt?.toISOString(),
      };

      const response = await fetch(`/api/admin/api-keys/${selectedKey.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        // Update permissions separately if changed
        if (data.permissions) {
          const permissions = data.permissions.map(perm => {
            const [resource, action] = perm.split(':');
            return { resource, action };
          });

          await fetch('/api/admin/api-keys', {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${currentToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              apiKeyId: selectedKey.id,
              permissions,
            }),
          });
        }

        await fetchApiKeys();
        setShowEditModal(false);
        setSelectedKey(null);
        onSave && onSave({ type: 'update', data });
      } else {
        const error = await response.json();
        alert(`Lỗi cập nhật API Key: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating API key:', error);
      alert('Có lỗi xảy ra khi cập nhật API Key');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKey = async () => {
    if (!selectedKey) return;
    
    try {
      setLoading(true);
      
      const currentToken = token || localStorage.getItem('token');
      if (!currentToken) {
        alert('Phiên đăng nhập đã hết hạn');
        return;
      }

      const response = await fetch(`/api/admin/api-keys/${selectedKey.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
        },
      });

      if (response.ok) {
        await fetchApiKeys();
        setShowDeleteModal(false);
        setSelectedKey(null);
        onSave && onSave({ type: 'delete', data: selectedKey });
      } else {
        const error = await response.json();
        alert(`Lỗi xóa API Key: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting API key:', error);
      alert('Có lỗi xảy ra khi xóa API Key');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    try {
      setLoading(true);
      
      const currentToken = token || localStorage.getItem('token');
      if (!currentToken) {
        alert('Phiên đăng nhập đã hết hạn');
        return;
      }

      const response = await fetch(`/api/admin/api-keys/${keyId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: false }),
      });

      if (response.ok) {
        await fetchApiKeys();
        onSave && onSave({ type: 'revoke', keyId });
      } else {
        const error = await response.json();
        alert(`Lỗi thu hồi API Key: ${error.error}`);
      }
    } catch (error) {
      console.error('Error revoking API key:', error);
      alert('Có lỗi xảy ra khi thu hồi API Key');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getStatusColor = (status: ApiKeyData['status']) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'revoked': return 'text-red-600 bg-red-100';
      case 'expired': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: ApiKeyData['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'revoked': return <XCircle className="h-4 w-4" />;
      case 'expired': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const maskApiKey = (key: string) => {
    return key.substring(0, 8) + '...' + key.substring(key.length - 8);
  };

  if (authLoading || (loading && apiKeys.length === 0)) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {authLoading ? 'Đang xác thực...' : 'Đang tải API keys...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">API Keys</h2>
          <p className="text-sm text-gray-600">Quản lý API keys và quyền truy cập</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={loading}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
          <span>Tạo API Key</span>
        </button>
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Lưu ý bảo mật</h3>
            <p className="text-sm text-yellow-700 mt-1">
              API keys có thể truy cập dữ liệu nhạy cảm. Hãy bảo mật thông tin này và không chia sẻ với bên thứ ba.
            </p>
          </div>
        </div>
      </div>

      {/* New API Key Alert */}
      {newApiKey && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-green-800">API Key được tạo thành công!</h3>
              <div className="mt-2">
                <p className="text-sm text-green-700 mb-2">
                  Đây là lần duy nhất bạn có thể xem API key này. Hãy sao chép và lưu trữ an toàn.
                </p>
                <div className="bg-white p-3 rounded border border-green-200">
                  <code className="text-sm text-gray-900 break-all font-mono">{newApiKey}</code>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <button
                    onClick={() => handleCopyKey(newApiKey)}
                    className="flex items-center space-x-1 text-green-600 hover:text-green-800"
                  >
                    {copiedKey === newApiKey ? (
                      <><Check className="h-4 w-4" /><span className="text-sm">Đã sao chép</span></>
                    ) : (
                      <><Copy className="h-4 w-4" /><span className="text-sm">Sao chép</span></>
                    )}
                  </button>
                  <button
                    onClick={() => setNewApiKey(null)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Keys List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên / Mô tả
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  API Key
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quyền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thống kê
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {apiKeys.map((apiKey) => (
                <tr key={apiKey.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{apiKey.name}</div>
                      {apiKey.description && (
                        <div className="text-sm text-gray-500">{apiKey.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {apiKey.key === 'hidden' ? `vpk_••••••••••••••••` : maskApiKey(apiKey.key)}
                      </code>
                      <div className="text-xs text-gray-500">
                        {apiKey.key === 'hidden' ? 'Key ẩn vì lý do bảo mật' : 'Key hiển thị'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {apiKey.permissions.slice(0, 3).map(permission => (
                        <span key={permission} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {API_KEY_PERMISSIONS.find(p => p.id === permission)?.name || permission}
                        </span>
                      ))}
                      {apiKey.permissions.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          +{apiKey.permissions.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(apiKey.status)}`}>
                      {getStatusIcon(apiKey.status)}
                      <span className="ml-1 capitalize">{apiKey.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1">
                        <Activity className="h-3 w-3" />
                        <span>{apiKey.requestCount} requests</span>
                      </div>
                      {apiKey.lastUsed && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>Dùng lần cuối: {formatDate(apiKey.lastUsed)}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => { setSelectedKey(apiKey); setShowEditModal(true); }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {apiKey.status === 'active' && (
                        <button
                          onClick={() => handleRevokeKey(apiKey.id)}
                          className="text-orange-600 hover:text-orange-900"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => { setSelectedKey(apiKey); setShowDeleteModal(true); }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateApiKeyModal
          onSave={handleCreateKey}
          onCancel={() => setShowCreateModal(false)}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedKey && (
        <EditApiKeyModal
          apiKey={selectedKey}
          onSave={handleUpdateKey}
          onCancel={() => { setShowEditModal(false); setSelectedKey(null); }}
        />
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedKey && (
        <DeleteApiKeyModal
          apiKey={selectedKey}
          onConfirm={handleDeleteKey}
          onCancel={() => { setShowDeleteModal(false); setSelectedKey(null); }}
        />
      )}
    </div>
  );
};

// Create API Key Modal Component
const CreateApiKeyModal: React.FC<{
  onSave: (data: CreateApiKeyRequest) => void;
  onCancel: () => void;
}> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState<CreateApiKeyRequest>({
    name: '',
    permissions: [],
    description: ''
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.permissions.length === 0) {
      alert('Vui lòng nhập tên và chọn ít nhất một quyền');
      return;
    }
    onSave(formData);
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked 
        ? [...prev.permissions, permissionId]
        : prev.permissions.filter(p => p !== permissionId)
    }));
  };

  const handleSelectAllPermissions = () => {
    const allPermissions = filteredPermissions.map(p => p.id);
    setFormData(prev => ({
      ...prev,
      permissions: [...new Set([...prev.permissions, ...allPermissions])]
    }));
  };

  const handleDeselectAllPermissions = () => {
    const filteredPermissionIds = filteredPermissions.map(p => p.id);
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.filter(p => !filteredPermissionIds.includes(p))
    }));
  };

  const filteredPermissions = selectedCategory 
    ? API_KEY_PERMISSIONS.filter(p => p.category === selectedCategory)
    : API_KEY_PERMISSIONS;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900">Tạo API Key mới</h3>
        </div>
        
        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên API Key *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ví dụ: Mobile App Key"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Mô tả mục đích sử dụng API key"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày hết hạn (tùy chọn)
              </label>
              <input
                type="date"
                value={formData.expiresAt ? formData.expiresAt.toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  expiresAt: e.target.value ? new Date(e.target.value) : undefined 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quyền truy cập *
                {formData.permissions.length === 0 && (
                  <span className="text-red-500 text-xs ml-1">(Chưa chọn quyền nào)</span>
                )}
              </label>
              
              <div className="mb-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Tất cả danh mục</option>
                  {API_KEY_CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-gray-500">
                      Đã chọn: {formData.permissions.length} quyền
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={handleSelectAllPermissions}
                        className="text-xs text-purple-600 hover:text-purple-800"
                      >
                        Chọn tất cả
                      </button>
                      <span className="text-xs text-gray-300">|</span>
                      <button
                        type="button"
                        onClick={handleDeselectAllPermissions}
                        className="text-xs text-gray-600 hover:text-gray-800"
                      >
                        Bỏ chọn tất cả
                      </button>
                    </div>
                  </div>
                  {filteredPermissions.map(permission => (
                    <label key={permission.id} className="flex items-start space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(permission.id)}
                        onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                        className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                        <div className="text-xs text-gray-500">{permission.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer - Fixed */}
        <div className="px-6 py-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Tạo API Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Edit API Key Modal Component
const EditApiKeyModal: React.FC<{
  apiKey: ApiKeyData;
  onSave: (data: UpdateApiKeyRequest) => void;
  onCancel: () => void;
}> = ({ apiKey, onSave, onCancel }) => {
  const [formData, setFormData] = useState<UpdateApiKeyRequest>({
    name: apiKey.name,
    permissions: apiKey.permissions,
    status: apiKey.status,
    description: apiKey.description || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked 
        ? [...(prev.permissions || []), permissionId]
        : (prev.permissions || []).filter(p => p !== permissionId)
    }));
  };

  const handleSelectAllPermissions = () => {
    const allPermissions = API_KEY_PERMISSIONS.map(p => p.id);
    setFormData(prev => ({
      ...prev,
      permissions: allPermissions
    }));
  };

  const handleDeselectAllPermissions = () => {
    setFormData(prev => ({
      ...prev,
      permissions: []
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900">Chỉnh sửa API Key</h3>
        </div>
        
        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên API Key
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="active">Hoạt động</option>
                <option value="revoked">Đã thu hồi</option>
                <option value="expired">Hết hạn</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quyền truy cập
              </label>
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-gray-500">
                      Đã chọn: {formData.permissions?.length || 0} quyền
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={handleSelectAllPermissions}
                        className="text-xs text-purple-600 hover:text-purple-800"
                      >
                        Chọn tất cả
                      </button>
                      <span className="text-xs text-gray-300">|</span>
                      <button
                        type="button"
                        onClick={handleDeselectAllPermissions}
                        className="text-xs text-gray-600 hover:text-gray-800"
                      >
                        Bỏ chọn tất cả
                      </button>
                    </div>
                  </div>
                  {API_KEY_PERMISSIONS.map(permission => (
                    <label key={permission.id} className="flex items-start space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.permissions?.includes(permission.id)}
                        onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                        className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                        <div className="text-xs text-gray-500">{permission.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer - Fixed */}
        <div className="px-6 py-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Cập nhật
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Delete API Key Modal Component
const DeleteApiKeyModal: React.FC<{
  apiKey: ApiKeyData;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ apiKey, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full flex flex-col">
        {/* Header - Fixed */}
        <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900">Xóa API Key</h3>
        </div>
        
        {/* Content */}
        <div className="px-6 py-4 flex-1">
          <p className="text-sm text-gray-600">
            Bạn có chắc chắn muốn xóa API Key <strong>{apiKey.name}</strong>? 
            Hành động này không thể hoàn tác.
          </p>
        </div>

        {/* Footer - Fixed */}
        <div className="px-6 py-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyManager;