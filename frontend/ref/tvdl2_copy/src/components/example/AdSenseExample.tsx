// Example usage of AdSense components
import React from 'react';
import { AdSenseBanner, AdSenseRectangle, AdSenseSkyscraper, AdSenseLeaderboard, AdSenseResponsive } from '@/components/AdSenseBanner';

export function AdSenseExample() {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Google AdSense Examples</h2>
      
      {/* Responsive Banner - tự động thích ứng kích thước */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Responsive Banner</h3>
        <AdSenseResponsive 
          slot="1234567890"
          className="border rounded-lg"
        />
      </div>

      {/* Rectangle Banner 300x250 */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Rectangle Banner (300x250)</h3>
        <AdSenseRectangle 
          slot="1234567891"
          className="mx-auto"
        />
      </div>

      {/* Leaderboard Banner 728x90 */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Leaderboard Banner (728x90)</h3>
        <AdSenseLeaderboard 
          slot="1234567892"
          className="mx-auto"
        />
      </div>

      {/* Skyscraper Banner 160x600 */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Skyscraper Banner (160x600)</h3>
        <AdSenseSkyscraper 
          slot="1234567893"
          className="mx-auto"
        />
      </div>

      {/* Custom AdSense Banner */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Custom Banner</h3>
        <AdSenseBanner
          slot="1234567894"
          format="auto"
          style={{ 
            width: '100%', 
            height: '280px',
            backgroundColor: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '8px'
          }}
          className="flex items-center justify-center"
        />
      </div>
    </div>
  );
}

// How to use in your pages:
export function PageWithAdSense() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Content */}
      <article className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Your Article Title</h1>
        
        {/* Article content */}
        <div className="prose max-w-none">
          <p>Your article content here...</p>
        </div>

        {/* AdSense Banner in between content */}
        <div className="my-8 flex justify-center">
          <AdSenseRectangle slot="YOUR_AD_SLOT_ID" />
        </div>

        {/* More content */}
        <div className="prose max-w-none">
          <p>More article content...</p>
        </div>
      </article>

      {/* Sidebar with AdSense */}
      <aside className="w-full lg:w-80 mt-8 lg:mt-0">
        <div className="space-y-6">
          <AdSenseSkyscraper slot="YOUR_SIDEBAR_AD_SLOT" />
          
          {/* Other sidebar content */}
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Related Articles</h3>
            {/* Related articles list */}
          </div>
        </div>
      </aside>
    </div>
  );
}