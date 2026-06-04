import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Use - ViralPeek',
  description: 'Read the terms and conditions for using ViralPeek. Our terms of use explain your rights and responsibilities when accessing our content and services.',
  keywords: ['terms of use', 'terms and conditions', 'user agreement', 'ViralPeek terms', 'service agreement'],
  openGraph: {
    title: 'Terms of Use - ViralPeek',
    description: 'Read the terms and conditions for using ViralPeek. Our terms explain your rights and responsibilities.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Terms of Use - ViralPeek',
    description: 'Read the terms and conditions for using ViralPeek. Our terms explain your rights and responsibilities.',
  },
};

export default function TermsOfUseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}