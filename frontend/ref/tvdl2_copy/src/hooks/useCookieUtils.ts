import { useCookieConsent } from '@/contexts/CookieContext';

/**
 * Utility hook để kiểm tra các tính năng có cần cookie consent hay không
 */
export function useCookieUtils() {
  const { hasConsent, isHydrated } = useCookieConsent();

  /**
   * Kiểm tra xem có thể sử dụng analytics không
   */
  const canUseAnalytics = () => {
    if (!isHydrated) return false; // Prevent hydration mismatch
    return hasConsent === true;
  };

  /**
   * Kiểm tra xem có thể hiển thị quảng cáo không
   */
  const canShowAds = () => {
    if (!isHydrated) return false; // Prevent hydration mismatch
    return hasConsent === true;
  };

  /**
   * Kiểm tra xem có thể sử dụng tính năng personalization không
   */
  const canUsePersonalization = () => {
    if (!isHydrated) return false; // Prevent hydration mismatch
    return hasConsent === true;
  };

  /**
   * Kiểm tra xem có thể hiển thị nội dung đầy đủ không
   */
  const canShowFullContent = () => {
    if (!isHydrated) return true; // Show content during hydration to prevent mismatch
    // Cho phép hiển thị nội dung nếu chưa quyết định hoặc đã đồng ý
    return hasConsent !== false;
  };

  /**
   * Kiểm tra xem có thể sử dụng social media features không
   */
  const canUseSocialFeatures = () => {
    if (!isHydrated) return false; // Prevent hydration mismatch
    return hasConsent === true;
  };

  /**
   * Kiểm tra xem có thể lưu preferences không
   */
  const canSavePreferences = () => {
    if (!isHydrated) return false; // Prevent hydration mismatch
    return hasConsent === true;
  };

  /**
   * Kiểm tra xem có thể tracking user behavior không
   */
  const canTrackBehavior = () => {
    if (!isHydrated) return false; // Prevent hydration mismatch
    return hasConsent === true;
  };

  /**
   * Lấy trạng thái consent hiện tại
   */
  const getConsentStatus = () => {
    return {
      hasConsent,
      isDecided: isHydrated && hasConsent !== null,
      isAccepted: isHydrated && hasConsent === true,
      isRejected: isHydrated && hasConsent === false,
      isPending: !isHydrated || hasConsent === null,
      isHydrated
    };
  };

  return {
    canUseAnalytics,
    canShowAds,
    canUsePersonalization,
    canShowFullContent,
    canUseSocialFeatures,
    canSavePreferences,
    canTrackBehavior,
    getConsentStatus,
    hasConsent,
    isHydrated
  };
}