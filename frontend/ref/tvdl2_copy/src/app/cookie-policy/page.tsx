import React from 'react';

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Cookie Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString('en-US')}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">What are Cookies?</h2>
              <p className="text-gray-700 mb-4">
                Cookies are small text files that are stored on your device when you visit a website. 
                They help the website "remember" information about your visit and improve the user experience.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">How Do We Use Cookies?</h2>
              <p className="text-gray-700 mb-4">
                ViralPeek uses cookies for the following purposes:
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Essential Cookies</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Maintain your login sessions</li>
                <li>Store language and interface preferences</li>
                <li>Ensure security and prevent fraud</li>
                <li>Store shopping cart information (if applicable)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Analytics Cookies</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Google Analytics to understand how users interact with our website</li>
                <li>Measure website performance</li>
                <li>Analyze traffic and user behavior</li>
                <li>Improve content and website functionality</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Advertising Cookies</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Display ads relevant to your interests</li>
                <li>Measure the effectiveness of advertising campaigns</li>
                <li>Prevent showing the same ad too many times</li>
                <li>Provide ads through Google AdSense</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Social Media Cookies</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Integration with social media platforms (Facebook, Twitter, Instagram)</li>
                <li>Allow content sharing on social media</li>
                <li>Login using social media accounts</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Cookies</h2>
              <p className="text-gray-700 mb-4">
                We may use third-party services that may place cookies on your device:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li><strong>Google Analytics:</strong> Website traffic analysis</li>
                <li><strong>Google AdSense:</strong> Display advertisements</li>
                <li><strong>Facebook Pixel:</strong> Track advertising conversions</li>
                <li><strong>YouTube:</strong> Embed videos</li>
                <li><strong>TikTok:</strong> Embed TikTok content</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Managing Cookies</h2>
              <p className="text-gray-700 mb-4">
                You can manage and control cookies in the following ways:
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Through Your Browser</h3>
              <p className="text-gray-700 mb-4">
                Most browsers allow you to:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>View which cookies have been stored</li>
                <li>Delete some or all cookies</li>
                <li>Block cookies from specific websites</li>
                <li>Block third-party cookies</li>
                <li>Delete all cookies when closing the browser</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Through Our Website</h3>
              <p className="text-gray-700 mb-4">
                You can change your cookie preferences at any time by clicking the 
                "Cookie Settings" link at the bottom of our website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Impact of Rejecting Cookies</h2>
              <p className="text-gray-700 mb-4">
                If you choose to reject or disable cookies:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Some website features may not function properly</li>
                <li>You may not be able to view the full content of articles</li>
                <li>Personalized experience will be limited</li>
                <li>You may need to log in more frequently</li>
                <li>Advertisements may not be relevant to your interests</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Policy Updates</h2>
              <p className="text-gray-700 mb-4">
                We may update this cookie policy from time to time to reflect 
                changes in our practices or for other operational, legal, or regulatory reasons. 
                We encourage you to review this policy periodically.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about this cookie policy, please contact us:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Email: privacy@viralpeek.com</li>
                <li>Contact page: <a href="/contact" className="text-purple-600 hover:text-purple-800 underline">/contact</a></li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}