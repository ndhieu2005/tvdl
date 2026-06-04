import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy - ViralPeek',
  description: 'Learn about how ViralPeek uses cookies to improve your browsing experience and provide personalized content.',
  keywords: ['cookie policy', 'privacy', 'data collection', 'ViralPeek cookies', 'website tracking'],
  openGraph: {
    title: 'Cookie Policy - ViralPeek',
    description: 'Learn about how ViralPeek uses cookies to improve your browsing experience.',
    type: 'website',
  },
  twitter: {
    title: 'Cookie Policy - ViralPeek',
    description: 'Learn about how ViralPeek uses cookies to improve your browsing experience.',
  }
};

export default function CookiePolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}