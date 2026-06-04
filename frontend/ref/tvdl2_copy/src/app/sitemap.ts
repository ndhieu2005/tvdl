import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://viralpeek.com'
  
  // Static pages (English only)
  const staticPages = [
    '',
    '/trending-now',
    '/sounds',
    '/challenges',
    '/filters',
    '/celebrities',
    '/top-lists',
    '/sport',
    '/about',
    '/contact',
    '/privacy-policy',
    '/terms-of-use'
  ]
  
  const staticUrls = staticPages.map(page => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date(),
    changeFrequency: page === '' ? 'daily' as const : 'weekly' as const,
    priority: page === '' ? 1 : 0.8,
  }))

  // Mock post URLs - in a real app, you'd fetch these from your CMS/database
  const mockPostSlugs = [
    'football-viral-celebration-2024',
    'basketball-trick-shots-trending',
    'tennis-serve-challenge',
    'swimming-training-tips',
    'running-form-viral',
    'gym-workout-trends'
  ]

  const postUrls = mockPostSlugs.map(slug => ({
    url: `${baseUrl}/post/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...staticUrls,
    ...postUrls,
  ]
}