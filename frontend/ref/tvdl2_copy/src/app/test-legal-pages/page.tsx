import React from 'react';
import Link from 'next/link';

export default function TestLegalPages() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Test Legal Pages
        </h1>
        <p className="text-xl text-gray-600">
          Test the newly created Privacy Policy and Terms of Use pages
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm p-8 border">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Privacy Policy</h2>
          <p className="text-gray-600 mb-6">
            Test the Privacy Policy page to ensure it displays correctly with all sections and styling.
          </p>
          <Link 
            href="/privacy-policy"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Privacy Policy
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 border">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Terms of Use</h2>
          <p className="text-gray-600 mb-6">
            Test the Terms of Use page to ensure it displays correctly with all sections and styling.
          </p>
          <Link 
            href="/terms-of-use"
            className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            View Terms of Use
          </Link>
        </div>
      </div>

      <div className="mt-12 text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Footer Links</h3>
        <p className="text-gray-600 mb-6">
          These pages are also accessible via the footer links at the bottom of every page.
        </p>
        <Link 
          href="/"
          className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}