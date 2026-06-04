'use client';

import React from 'react';
import { useCookieConsent } from '@/contexts/CookieContext';
import { CookieRejectedMessage } from '@/components/CookieBanner';

interface ContentGuardProps {
  children: React.ReactNode;
  requireCookieConsent?: boolean;
  fallback?: React.ReactNode;
}

export default function ContentGuard({ 
  children, 
  requireCookieConsent = true,
  fallback 
}: ContentGuardProps) {
  const { hasConsent } = useCookieConsent();

  // Nếu không yêu cầu cookie consent, hiển thị nội dung bình thường
  if (!requireCookieConsent) {
    return <>{children}</>;
  }

  // Nếu chưa quyết định (null), hiển thị nội dung nhưng sẽ có banner
  if (hasConsent === null) {
    return <>{children}</>;
  }

  // Nếu đã đồng ý (true), hiển thị nội dung
  if (hasConsent === true) {
    return <>{children}</>;
  }

  // Nếu từ chối (false), hiển thị thông báo hoặc fallback
  if (hasConsent === false) {
    return fallback ? <>{fallback}</> : <CookieRejectedMessage />;
  }

  return <>{children}</>;
}

// Component wrapper cho nội dung bài viết
export function ArticleContentGuard({ children }: { children: React.ReactNode }) {
  return (
    <ContentGuard requireCookieConsent={true}>
      {children}
    </ContentGuard>
  );
}

// Component wrapper cho nội dung không bắt buộc cookie
export function PublicContentGuard({ children }: { children: React.ReactNode }) {
  return (
    <ContentGuard requireCookieConsent={false}>
      {children}
    </ContentGuard>
  );
}