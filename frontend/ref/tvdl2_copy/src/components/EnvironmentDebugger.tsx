'use client';

import { useState, useEffect } from 'react';

export default function EnvironmentDebugger() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="bg-red-500 text-white px-2 py-1 rounded text-xs"
      >
        ENV DEBUG
      </button>
      
      {showDebug && (
        <div className="absolute top-8 right-0 bg-black text-white p-4 rounded shadow-lg text-xs whitespace-pre-wrap max-w-md">
          <div className="font-bold mb-2">Environment Variables:</div>
          <div>NEXT_PUBLIC_ENVIRONMENT: {process.env.NEXT_PUBLIC_ENVIRONMENT || 'undefined'}</div>
          <div>NODE_ENV: {process.env.NODE_ENV || 'undefined'}</div>
          <div className="mt-2 font-bold">Window Location:</div>
          <div>Host: {typeof window !== 'undefined' ? window.location.host : 'N/A'}</div>
          <div>Protocol: {typeof window !== 'undefined' ? window.location.protocol : 'N/A'}</div>
        </div>
      )}
    </div>
  );
}