'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Eye, Lock, Database, Globe, Mail } from 'lucide-react';
import { usePublicSettings } from '@/hooks/usePublicSettings';

export default function PrivacyPolicyPage() {
  const { settings } = usePublicSettings();
  
  // Get email from settings with fallback
  const privacyEmail = settings?.adminEmail || 'admin@trendiefox.com';
  const businessAddress = settings?.businessAddress || 'Ho Chi Minh City, Vietnam';
  const siteName = settings?.siteName || 'ViralPeek';
  const siteUrl = settings?.siteUrl || 'https://trendiefox.com';
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Privacy Policy
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Your privacy is important to us. This policy explains how we collect, use, and protect your information.
        </p>
        <p className="text-sm text-gray-500 mt-4">
          Last updated: {new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      <div className="space-y-8">
        {/* Introduction */}
        <section className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center mb-6">
            <Shield className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Introduction</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Welcome to {siteName}! We are committed to protecting your privacy and ensuring you have a positive experience on our website. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website <strong>{siteUrl}</strong> and use our services.
          </p>
          <p className="text-gray-600">
            By using our website, you agree to the collection and use of information in accordance with this Privacy Policy. If you do not agree with our policies and practices, please do not use our services.
          </p>
        </section>

        {/* Information We Collect */}
        <section className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center mb-6">
            <Database className="h-8 w-8 text-purple-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Personal Information</h3>
              <p className="text-gray-600 mb-2">We may collect personal information that you voluntarily provide to us, including:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li>Email address (for newsletter subscriptions)</li>
                <li>Name (if you contact us or leave comments)</li>
                <li>Contact information (when you reach out to us)</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Automatically Collected Information</h3>
              <p className="text-gray-600 mb-2">When you visit our website, we may automatically collect:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li>IP address and browser information</li>
                <li>Device type and operating system</li>
                <li>Pages viewed and time spent on our site</li>
                <li>Referring website and search terms</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </div>
          </div>
        </section>

        {/* How We Use Your Information */}
        <section className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center mb-6">
            <Eye className="h-8 w-8 text-green-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">How We Use Your Information</h2>
          </div>
          
          <p className="text-gray-600 mb-4">We use the information we collect to:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li>Provide, maintain, and improve our website and services</li>
            <li>Send you newsletters and updates (if you've subscribed)</li>
            <li>Respond to your inquiries and customer service requests</li>
            <li>Analyze website usage and trends to improve user experience</li>
            <li>Protect against fraudulent or illegal activities</li>
            <li>Comply with legal obligations</li>
            <li>Display relevant advertisements and content</li>
          </ul>
        </section>

        {/* Cookies and Tracking */}
        <section className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center mb-6">
            <Globe className="h-8 w-8 text-orange-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Cookies and Tracking Technologies</h2>
          </div>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              We use cookies and similar tracking technologies to enhance your browsing experience. Cookies are small data files stored on your device that help us:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
              <li>Remember your preferences and settings</li>
              <li>Analyze website traffic and usage patterns</li>
              <li>Provide personalized content and advertisements</li>
              <li>Improve website functionality and performance</li>
            </ul>
            <p className="text-gray-600">
              You can control cookies through your browser settings, but disabling them may affect your experience on our website.
            </p>
          </div>
        </section>

        {/* Third-Party Services */}
        <section className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center mb-6">
            <Lock className="h-8 w-8 text-red-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Third-Party Services</h2>
          </div>
          
          <div className="space-y-4">
            <p className="text-gray-600">We may use third-party services that collect information about you:</p>
            
            <div className="space-y-3">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-gray-800">Google Analytics</h4>
                <p className="text-gray-600 text-sm">
                  We use Google Analytics to analyze website traffic and user behavior. Google may collect and process data according to their privacy policy.
                </p>
              </div>
              
              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold text-gray-800">Google AdSense</h4>
                <p className="text-gray-600 text-sm">
                  We may display advertisements through Google AdSense. Google may use cookies to serve ads based on your previous visits to our website.
                </p>
              </div>
              
              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold text-gray-800">TikTok Embeds</h4>
                <p className="text-gray-600 text-sm">
                  We embed TikTok videos on our site. TikTok may collect information when you interact with these embeds according to their privacy policy.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Data Protection */}
        <section className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center mb-6">
            <Shield className="h-8 w-8 text-indigo-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Data Protection and Security</h2>
          </div>
          
          <p className="text-gray-600 mb-4">
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure.
          </p>
          <p className="text-gray-600">
            We retain your information only as long as necessary for the purposes outlined in this Privacy Policy or as required by law.
          </p>
        </section>

        {/* Your Rights */}
        <section className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center mb-6">
            <Eye className="h-8 w-8 text-teal-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Your Privacy Rights</h2>
          </div>
          
          <p className="text-gray-600 mb-4">Depending on your location, you may have the following rights:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li>Access to your personal information</li>
            <li>Correction of inaccurate information</li>
            <li>Deletion of your personal information</li>
            <li>Restriction of processing</li>
            <li>Data portability</li>
            <li>Opt-out of marketing communications</li>
          </ul>
          <p className="text-gray-600 mt-4">
            To exercise any of these rights, please contact us using the information provided below.
          </p>
        </section>

        {/* Children's Privacy */}
        <section className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center mb-6">
            <Shield className="h-8 w-8 text-pink-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Children's Privacy</h2>
          </div>
          
          <p className="text-gray-600">
            Our website is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.
          </p>
        </section>

        {/* Changes to Privacy Policy */}
        <section className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center mb-6">
            <Globe className="h-8 w-8 text-gray-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Changes to This Privacy Policy</h2>
          </div>
          
          <p className="text-gray-600">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically for any changes.
          </p>
        </section>

        {/* Contact Information */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
          <div className="flex items-center mb-6">
            <Mail className="h-8 w-8 text-white mr-3" />
            <h2 className="text-2xl font-bold text-white">Contact Us</h2>
          </div>
          
          <p className="mb-4">
            If you have any questions about this Privacy Policy or our data practices, please contact us at:
          </p>
          <div className="space-y-2">
            <p><strong>Email:</strong> {privacyEmail}</p>
            <p><strong>Website:</strong> {siteUrl}</p>
            <p><strong>Address:</strong> {businessAddress}</p>
          </div>
        </section>
      </div>
    </div>
  );
}