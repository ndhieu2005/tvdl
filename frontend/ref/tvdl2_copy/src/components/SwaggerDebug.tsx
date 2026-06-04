'use client';

import { useState, useEffect } from 'react';

interface SwaggerDebugProps {
  spec: any;
}

export default function SwaggerDebug({ spec }: SwaggerDebugProps) {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isSwaggerLoaded, setIsSwaggerLoaded] = useState(false);

  useEffect(() => {
    const checkSwagger = () => {
      setDebugInfo({
        hasSpec: !!spec,
        specType: typeof spec,
        specKeys: spec ? Object.keys(spec) : [],
        windowSwagger: !!window.SwaggerUIBundle,
        timestamp: new Date().toISOString()
      });
      setIsSwaggerLoaded(!!window.SwaggerUIBundle);
    };

    checkSwagger();
    
    // Kiểm tra mỗi 1 giây
    const interval = setInterval(checkSwagger, 1000);
    
    return () => clearInterval(interval);
  }, [spec]);

  return (
    <div className="p-4 border rounded bg-gray-50">
      <h2 className="text-lg font-bold mb-4">Swagger Debug Info</h2>
      
      <div className="space-y-2 text-sm">
        <div><strong>Has Spec:</strong> {debugInfo.hasSpec ? 'Yes' : 'No'}</div>
        <div><strong>Spec Type:</strong> {debugInfo.specType}</div>
        <div><strong>Spec Keys:</strong> {debugInfo.specKeys?.join(', ')}</div>
        <div><strong>SwaggerUI Loaded:</strong> {isSwaggerLoaded ? 'Yes' : 'No'}</div>
        <div><strong>Last Check:</strong> {debugInfo.timestamp}</div>
      </div>

      {spec && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Spec Preview:</h3>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
            {JSON.stringify(spec, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}