'use client';

import { useState, useEffect } from 'react';

export default function TestAuthDebug() {
  const [logs, setLogs] = useState<string[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    addLog(`Token từ localStorage: ${savedToken ? 'Có' : 'Không'}`);
    addLog(`User từ localStorage: ${savedUser ? 'Có' : 'Không'}`);
    
    if (savedToken) {
      setToken(savedToken);
      addLog(`Token: ${savedToken.substring(0, 20)}...`);
    }
    
    if (savedUser) {
      try {
        const userObj = JSON.parse(savedUser);
        setUser(userObj);
        addLog(`User: ${userObj.email}, Role: ${userObj.role}`);
      } catch (e) {
        addLog(`Lỗi parse user: ${e}`);
      }
    }
  }, []);

  const testAPI = async () => {
    if (!token) {
      addLog('Không có token để test');
      return;
    }

    try {
      addLog('Đang gọi API /api/auth/me...');
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      addLog(`API response status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        addLog(`API response success: ${JSON.stringify(data.user)}`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        addLog(`API response error: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      addLog(`API call failed: ${error}`);
    }
  };

  const testLogin = async () => {
    try {
      addLog('Đang test login với thedaovan@gmail.com...');
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'thedaovan@gmail.com',
          password: '12341234'
        }),
      });

      addLog(`Login response status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        addLog(`Login success: ${JSON.stringify(data.user)}`);
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        const errorData = await response.json().catch(() => ({}));
        addLog(`Login error: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      addLog(`Login failed: ${error}`);
    }
  };

  const testAdminLogin = async () => {
    try {
      addLog('Đang test login với admin@trendiefox.com...');
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@trendiefox.com',
          password: 'admin123456'
        }),
      });

      addLog(`Admin login response status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        addLog(`Admin login success: ${JSON.stringify(data.user)}`);
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        const errorData = await response.json().catch(() => ({}));
        addLog(`Admin login error: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      addLog(`Admin login failed: ${error}`);
    }
  };

  const testCreatePost = async () => {
    if (!token) {
      addLog('Không có token để test create post');
      return;
    }

    try {
      addLog('Đang test create post...');
      const postData = {
        title: 'Test Post ' + Date.now(),
        slug: 'test-post-' + Date.now(),
        content: 'This is a test post content',
        excerpt: 'Test excerpt',
        featuredImage: '',
        videoUrl: '',
        category: 'trending-now',
        tags: ['test'],
        status: 'draft',
        publishDate: new Date().toISOString(),
        seo: {
          metaTitle: 'Test Post',
          metaDescription: 'Test post description',
          keywords: 'test'
        }
      };

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postData),
      });

      addLog(`Create post response status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        addLog(`Create post success: ${JSON.stringify(data, null, 2)}`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        addLog(`Create post error: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      addLog(`Create post failed: ${error}`);
    }
  };

  const updateRoleToEditor = async () => {
    if (!user || !user.email) {
      addLog('Không có user để update role');
      return;
    }

    try {
      addLog(`Đang update role cho user ${user.email} thành EDITOR...`);
      const response = await fetch('/api/users/update-role', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          role: 'EDITOR'
        }),
      });

      addLog(`Update role response status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        addLog(`Update role success: ${JSON.stringify(data.data)}`);
        
        // Update local user data
        const updatedUser = { ...user, role: 'EDITOR' };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Re-login to get new token with updated role
        await testLogin();
      } else {
        const errorData = await response.json().catch(() => ({}));
        addLog(`Update role error: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      addLog(`Update role failed: ${error}`);
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Clear all cookies
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    setToken(null);
    setUser(null);
    addLog('Đã xóa auth data và cookies');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Auth Debug Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Current State</h2>
            <div className="bg-white p-4 rounded-lg shadow">
              <p><strong>Token:</strong> {token ? 'Có' : 'Không'}</p>
              <p><strong>User:</strong> {user ? user.email : 'Không'}</p>
              <p><strong>Role:</strong> {user ? user.role : 'N/A'}</p>
            </div>
            
            <div className="mt-4 space-y-2">
              <button
                onClick={testAPI}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Test API /api/auth/me
              </button>
              <button
                onClick={testLogin}
                className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Test Login (thedaovan@gmail.com)
              </button>
              <button
                onClick={testAdminLogin}
                className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
              >
                Test Admin Login
              </button>
              <button
                onClick={testCreatePost}
                className="w-full bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
              >
                Test Create Post
              </button>
              <button
                onClick={updateRoleToEditor}
                className="w-full bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
              >
                Update Role to EDITOR
              </button>
              <button
                onClick={clearAuth}
                className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Clear Auth Data
              </button>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Debug Logs</h2>
            <div className="bg-black text-green-400 p-4 rounded-lg h-96 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="text-xs mb-1">{log}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}