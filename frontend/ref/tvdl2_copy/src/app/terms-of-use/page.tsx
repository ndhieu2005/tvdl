'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Scale, AlertTriangle, Users, Globe, Mail } from 'lucide-react';
import { usePublicSettings } from '@/hooks/usePublicSettings';

export default function TermsOfUsePage() {
  const { settings } = usePublicSettings();
  
  // Get email from settings with fallback
  const legalEmail = settings?.adminEmail || 'legal@viralpeek.com';
  const businessAddress = settings?.businessAddress || '[Your Business Address]';
  const siteName = settings?.siteName || 'ViralPeek';
  const siteUrl = settings?.siteUrl || 'viralpeek.com';
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Terms of Use
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Please read these terms and conditions carefully before using our website and services.
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
            <FileText className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Agreement to Terms</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Welcome to {siteName}! These Terms of Use ("Terms") govern your access to and use of our website <strong>{siteUrl}</strong> and all related services, features, and content provided by {siteName} ("we," "us," or "our").
          </p>
          <p className="text-gray-600 mb-4">
            By accessing or using our website, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our website.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-yellow-800 text-sm">
                <strong>Important:</strong> These Terms may be updated from time to time. Your continued use of the website after any changes indicates your acceptance of the new Terms.
              </p>
            </div>
          </div>
        </section>

        {/* Description of Service */}
        <section className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center mb-6">
            <Globe className="h-8 w-8 text-purple-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Description of Service</h2>
          </div>
          <p className="text-gray-600 mb-4">
            {siteName} is an entertainment and news website that provides content related to:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4 mb-4">
            <li>TikTok trends and viral content</li>
            <li>Social media culture and analysis</li>
            <li>Entertainment news and updates</li>
            <li>Celebrity content and moments</li>
            <li>Music and sound trends</li>
            <li>Challenges and viral phenomena</li>
          </ul>
          <p className="text-gray-600">
            Our service is provided for informational and entertainment purposes only. We reserve the right to modify, suspend, or discontinue any aspect of our service at any time without notice.
          </p>
        </section>

        {/* User Responsibilities */}
        <section className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center mb-6">
            <Users className="h-8 w-8 text-green-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">User Responsibilities</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Acceptable Use</h3>
              <p className="text-gray-600 mb-2">When using our website, you agree to:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li>Use the website only for lawful purposes</li>
                <li>Respect the rights and privacy of others</li>
                <li>Not engage in any harmful or disruptive behavior</li>
                <li>Not attempt to gain unauthorized access to our systems</li>
                <li>Not use automated tools to scrape or harvest content</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Prohibited Activities</h3>
              <p className="text-gray-600 mb-2">You may not:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li>Post or transmit harmful, offensive, or illegal content</li>
                <li>Impersonate any person or entity</li>
                <li>Engage in spam, phishing, or other deceptive practices</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Interfere with the proper functioning of the website</li>
                <li>Attempt to reverse engineer any part of our service</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Intellectual Property */}
        <section className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center mb-6">
            <Scale className="h-8 w-8 text-orange-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Intellectual Property Rights</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Our Content</h3>
              <p className="text-gray-600">
                All content on {siteName}, including but not limited to text, graphics, logos, images, and software, is the property of {siteName} or its licensors and is protected by copyright, trademark, and other intellectual property laws.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Third-Party Content</h3>
              <p className="text-gray-600">
                We may display content from third parties, including embedded videos from TikTok and other social media platforms. Such content remains the property of their respective owners. We respect intellectual property rights and expect our users to do the same.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Fair Use</h3>
              <p className="text-gray-600">
                Our use of third-party content is intended for commentary, criticism, and news reporting purposes under fair use principles. If you believe your content has been used inappropriately, please contact us.
              </p>
            </div>
          </div>
        </section>

        {/* Privacy and Data */}
        <section className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center mb-6">
            <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Privacy and Data Collection</h2>
          </div>
          
          <p className="text-gray-600 mb-4">
            Your privacy is important to us. Our collection and use of your personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.
          </p>
          <p className="text-gray-600">
            By using our website, you consent to the collection and use of your information as described in our Privacy Policy.
          </p>
        </section>

        {/* Disclaimers */}
        <section className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center mb-6">
            <AlertTriangle className="h-8 w-8 text-yellow-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Disclaimers</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Content Accuracy</h3>
              <p className="text-gray-600">
                While we strive to provide accurate and up-to-date information, we make no warranties about the completeness, accuracy, or reliability of the content on our website. Information is provided "as is" without warranty of any kind.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Third-Party Links</h3>
              <p className="text-gray-600">
                Our website may contain links to third-party websites. We are not responsible for the content, privacy practices, or terms of use of these external sites. We encourage you to review their policies before engaging with them.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Service Availability</h3>
              <p className="text-gray-600">
                We cannot guarantee that our website will be available at all times or that it will be free from errors, viruses, or other harmful components. We reserve the right to modify or discontinue our service at any time.
              </p>
            </div>
          </div>
        </section>

        {/* Limitation of Liability */}
        <section className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center mb-6">
            <Scale className="h-8 w-8 text-indigo-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Limitation of Liability</h2>
          </div>
          
          <p className="text-gray-600 mb-4">
            To the fullest extent permitted by law, {siteName} and its affiliates, officers, directors, employees, and agents will not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of our website.
          </p>
          <p className="text-gray-600">
            Our total liability to you for all claims arising out of or relating to these Terms or your use of our website will not exceed the amount you paid us, if any, for accessing our website.
          </p>
        </section>

        {/* Indemnification */}
        <section className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center mb-6">
            <Users className="h-8 w-8 text-teal-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Indemnification</h2>
          </div>
          
          <p className="text-gray-600">
            You agree to indemnify, defend, and hold harmless {siteName} and its affiliates, officers, directors, employees, and agents from and against any and all claims, damages, losses, costs, and expenses (including reasonable attorneys' fees) arising out of or relating to your use of our website or your violation of these Terms.
          </p>
        </section>

        {/* Termination */}
        <section className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center mb-6">
            <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Termination</h2>
          </div>
          
          <p className="text-gray-600 mb-4">
            We may terminate or suspend your access to our website immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms.
          </p>
          <p className="text-gray-600">
            Upon termination, your right to use our website will cease immediately. All provisions of these Terms that by their nature should survive termination shall survive termination.
          </p>
        </section>

        {/* Governing Law */}
        <section className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center mb-6">
            <Scale className="h-8 w-8 text-purple-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Governing Law</h2>
          </div>
          
          <p className="text-gray-600">
            These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions. Any disputes arising under these Terms shall be resolved in the courts of [Your Jurisdiction].
          </p>
        </section>

        {/* Changes to Terms */}
        <section className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center mb-6">
            <FileText className="h-8 w-8 text-gray-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Changes to These Terms</h2>
          </div>
          
          <p className="text-gray-600">
            We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms on this page and updating the "Last updated" date. Your continued use of our website after any such changes constitutes your acceptance of the new Terms.
          </p>
        </section>

        {/* Contact Information */}
        <section className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-white">
          <div className="flex items-center mb-6">
            <Mail className="h-8 w-8 text-white mr-3" />
            <h2 className="text-2xl font-bold text-white">Contact Us</h2>
          </div>
          
          <p className="mb-4">
            If you have any questions about these Terms of Use, please contact us at:
          </p>
          <div className="space-y-2">
            <p><strong>Email:</strong> {legalEmail}</p>
            <p><strong>Website:</strong> {siteUrl}</p>
            <p><strong>Address:</strong> {businessAddress}</p>
          </div>
        </section>
      </div>
    </div>
  );
}