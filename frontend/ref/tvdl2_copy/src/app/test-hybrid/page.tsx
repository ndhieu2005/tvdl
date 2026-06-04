'use client';

import { useState } from 'react';

export default function TestHybridPage() {
  const [apiKeyResult, setApiKeyResult] = useState<string>('');
  const [jwtResult, setJwtResult] = useState<string>('');
  
  const testApiKey = async () => {
    const apiKey = 'vp_86ec66e846c0056e4aa4182cc4cfd68000828c742b5f76cf85c0ba5407ceb2253';
    
    try {
      setApiKeyResult('🔄 Testing API key authentication...');
      
      const response = await fetch(`/api/posts?page=1&limit=10`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setApiKeyResult(`✅ API Key Success (${response.status}): ${JSON.stringify(data, null, 2)}`);
      } else {
        setApiKeyResult(`❌ API Key Failed (${response.status}): ${JSON.stringify(data, null, 2)}`);
      }
      
    } catch (error: any) {
      setApiKeyResult(`💥 API Key Error: ${error.message}`);
    }
  };
  
  const testJWT = async () => {
    try {
      setJwtResult('🔄 Getting JWT token...');
      
      // First, login to get JWT token
      const loginResponse = await fetch(`/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@viralpeek.com',
          password: 'admin123'
        })
      });
      
      const loginData = await loginResponse.json();
      
      if (!loginResponse.ok) {
        setJwtResult(`❌ Login Failed (${loginResponse.status}): ${JSON.stringify(loginData, null, 2)}`);
        return;
      }
      
      const jwtToken = loginData.token;
      setJwtResult(`✅ JWT Token received: ${jwtToken.substring(0, 20)}...\n🔄 Testing posts API...`);
      
      // Test posts API with JWT
      const postsResponse = await fetch(`/api/posts?page=1&limit=10`, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const postsData = await postsResponse.json();
      
      if (postsResponse.ok) {
        setJwtResult(`✅ JWT Success (${postsResponse.status}): ${JSON.stringify(postsData, null, 2)}`);
      } else {
        setJwtResult(`❌ JWT Posts Failed (${postsResponse.status}): ${JSON.stringify(postsData, null, 2)}`);
      }
      
    } catch (error: any) {
      setJwtResult(`💥 JWT Error: ${error.message}`);
    }
  };
  
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: '20px' }}>
      <h1>Hybrid Authentication Test</h1>
      
      <div style={{ margin: '20px 0', padding: '20px', border: '1px solid #ccc' }}>
        <h2>Test 1: API Key Authentication</h2>
        <button onClick={testApiKey} style={{ padding: '10px 20px', margin: '10px' }}>
          Test API Key
        </button>
        <div style={{ 
          margin: '10px 0', 
          padding: '10px', 
          background: '#f0f0f0',
          whiteSpace: 'pre-wrap',
          fontSize: '12px'
        }}>
          {apiKeyResult}
        </div>
      </div>

      <div style={{ margin: '20px 0', padding: '20px', border: '1px solid #ccc' }}>
        <h2>Test 2: JWT Authentication</h2>
        <button onClick={testJWT} style={{ padding: '10px 20px', margin: '10px' }}>
          Test JWT
        </button>
        <div style={{ 
          margin: '10px 0', 
          padding: '10px', 
          background: '#f0f0f0',
          whiteSpace: 'pre-wrap',
          fontSize: '12px'
        }}>
          {jwtResult}
        </div>
      </div>
    </div>
  );
}