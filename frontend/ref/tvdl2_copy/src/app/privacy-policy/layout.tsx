import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - ViralPeek',
  description: 'Learn how ViralPeek protects your privacy and handles your personal information. Our comprehensive privacy policy explains data collection, usage, and your rights.',
  keywords: ['privacy policy', 'data protection', 'personal information', 'ViralPeek privacy', 'user rights'],
  openGraph: {
    title: 'Privacy Policy - ViralPeek',
    description: 'Learn how ViralPeek protects your privacy and handles your personal information.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Privacy Policy - ViralPeek',
    description: 'Learn how ViralPeek protects your privacy and handles your personal information.',
  },
};

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}