import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ViralPeek API Documentation',
  description: 'Comprehensive API documentation for ViralPeek entertainment news platform',
  robots: 'noindex, nofollow',
};

export default function ApiDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}