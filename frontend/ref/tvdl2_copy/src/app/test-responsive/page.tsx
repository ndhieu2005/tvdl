import Image from 'next/image';

export default function TestResponsive() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">📱 Responsive Image Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Test 1: Plain img tag */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test 1: Plain img tag</h2>
            <img 
              src="/api/public/files/test-image.webp" 
              alt="Plain WebP" 
              className="w-full h-48 object-cover border border-gray-300 rounded"
            />
          </div>
          
          {/* Test 2: Next.js Image without wrapper */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test 2: Next.js Image (no wrapper)</h2>
            <div className="relative w-full h-48">
              <Image
                src="/api/public/files/test-image.webp"
                alt="Next.js WebP"
                fill
                style={{ objectFit: 'cover' }}
                className="border border-gray-300 rounded"
              />
            </div>
          </div>
          
          {/* Test 3: Next.js Image with webp-safe-container */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test 3: With webp-safe-container</h2>
            <div className="relative w-full h-48 webp-safe-container">
              <Image
                src="/api/public/files/test-image.webp"
                alt="WebP Safe Container"
                fill
                style={{ objectFit: 'cover' }}
                className="border border-gray-300 rounded"
              />
            </div>
          </div>
          
          {/* Test 4: JPG fallback */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test 4: JPG fallback</h2>
            <div className="relative w-full h-48">
              <Image
                src="/api/public/files/test-image.jpg"
                alt="JPG Fallback"
                fill
                style={{ objectFit: 'cover' }}
                className="border border-gray-300 rounded"
              />
            </div>
          </div>
          
          {/* Test 5: Data URL */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test 5: Data URL WebP</h2>
            <img 
              src="data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA" 
              alt="Data URL WebP" 
              className="w-full h-48 object-cover border border-gray-300 rounded"
            />
          </div>
          
          {/* Test 6: Large WebP */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test 6: Larger WebP (base64)</h2>
            <img 
              src="data:image/webp;base64,UklGRnoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABwBAJ0BKgEAAQAAAP4AAA3AAP7mtQAAAA==" 
              alt="Large Data URL WebP" 
              className="w-full h-48 object-cover border border-gray-300 rounded"
            />
          </div>
        </div>
        
        <div className="mt-8 bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">🔍 Debug Info:</h3>
          <div className="text-sm space-y-1">
            <div>Screen Width: <span className="font-mono">JS: {typeof window !== 'undefined' ? window.innerWidth : 'N/A'}</span></div>
            <div>CSS Classes: <span className="font-mono">webp-safe-container</span></div>
            <div>Test URLs:</div>
            <div className="ml-4 text-xs">
              <div>WebP: /api/public/files/test-image.webp</div>
              <div>JPG: /api/public/files/test-image.jpg</div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">📱 Test Instructions:</h3>
          <ol className="text-sm space-y-1 list-decimal list-inside">
            <li>Open browser Developer Tools (F12)</li>
            <li>Switch to responsive mode (Ctrl+Shift+M)</li>
            <li>Set viewport to iPhone/mobile size</li>
            <li>Check which images display vs show as white</li>
            <li>Check Network tab for failed requests</li>
            <li>Check Console for errors</li>
          </ol>
        </div>
      </div>
    </div>
  );
}