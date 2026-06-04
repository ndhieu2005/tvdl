import { Raleway } from "next/font/google";
import type { Metadata, Viewport } from "next";
import Analytics from "@/components/Analytics";
import { ServerGoogleAnalytics } from "@/components/ServerGoogleAnalytics";
import { ServerGoogleAdsense } from "@/components/ServerGoogleAdsense";
import {
  getGoogleAnalyticsId,
  getGoogleAdsenseId,
} from "@/lib/server-settings";
import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { ServerSettingsProvider } from "@/contexts/ServerSettingsContext";
import { CookieProvider } from "@/contexts/CookieContext";
import ConditionalLayout from "@/components/ConditionalLayout";
import CookieBanner from "@/components/CookieBanner";
import CookieStatusIndicator from "@/components/CookieStatusIndicator";
import ConditionalAdsense from "@/components/ConditionalAdsense";
import NoSSR from "@/components/NoSSR";
import CookieTestWidget from "@/components/CookieTestWidget";
import { ReadingHistoryTrigger } from "@/components/ReadingHistoryWidget";
import ImageDebugger from "@/components/ImageDebugger";
import { SettingsPreloader } from "@/components/SettingsPreloader";

import { getPublicSettings, generateDynamicIcons } from "@/lib/metadata";
import { getServerSettings } from "@/lib/server-settings-cache";

import "./globals.css";
import "@/styles/colors.css";
import IOSSafariStyles from "@/components/IOSSafariStyles";

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
});

// Separate viewport export (Next.js 15 requirement)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();
  const dynamicIcons = await generateDynamicIcons();

  const title =
    settings?.metaTitle || "Thư viện Dương Liễu - Hệ thống quản lý thư viện";
  const description =
    settings?.metaDescription ||
    "Hệ thống quản lý Thư viện Dương Liễu với các dịch vụ đăng ký thẻ, đặt phòng, sách mới và tin tức.";
  const keywords =
    settings?.keywords ||
    "thư viện, sách, đăng ký thẻ, đặt phòng, tin tức, sự kiện";
  const siteUrl = settings?.siteUrl || "https://thuvienduonglieu.com";
  const ogImage = settings?.ogImage || "/images/og-image.svg";

  return {
    title,
    description,
    keywords,
    authors: [{ name: "Thư viện Dương Liễu" }],

    // Dynamic Icons from settings
    icons: dynamicIcons,

    openGraph: {
      title,
      description,
      url: siteUrl,
      siteName: settings?.siteName || "Thư viện Dương Liễu",
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch Google Analytics and AdSense IDs from settings
  const gaId = await getGoogleAnalyticsId();
  const adsenseId = await getGoogleAdsenseId();

  // Fetch server settings for SSR
  const serverSettings = await getServerSettings();

  return (
    <html lang="en" className={`${raleway.variable} font-sans`}>
      <body>
        {/* Google Analytics */}
        <ServerGoogleAnalytics gaId={gaId} />

        {/* Google AdSense - Server Side (non-personalized) */}
        <ServerGoogleAdsense adsenseId={adsenseId} />

        <AuthProvider>
          <ServerSettingsProvider initialSettings={serverSettings}>
            <SettingsProvider>
              <CookieProvider>
                {/* Preload settings into cache immediately */}
                <SettingsPreloader initialSettings={serverSettings} />

                <ConditionalLayout>{children}</ConditionalLayout>
                <Analytics />

                {/* Conditional AdSense - Client Side (personalized) */}
                <NoSSR>
                  <ConditionalAdsense adsenseId={adsenseId} />
                </NoSSR>

                {/* Cookie Banner */}
                <NoSSR>
                  <CookieBanner />
                </NoSSR>

                {/* Cookie Status Indicator */}
                <NoSSR>
                  <CookieStatusIndicator />
                </NoSSR>

                {/* Reading History Trigger - Only show in development/staging */}
                {process.env.NEXT_PUBLIC_ENVIRONMENT !== "production" && (
                  <NoSSR>
                    <ReadingHistoryTrigger />
                  </NoSSR>
                )}

                {/* Debug Tool - Only show in staging */}
                {process.env.NEXT_PUBLIC_ENVIRONMENT === "staging" && (
                  <NoSSR>
                    <ImageDebugger />
                  </NoSSR>
                )}

                {/* Cookie Test Widget - Only show in development */}
                {process.env.NODE_ENV !== "production" && (
                  <NoSSR>
                    <CookieTestWidget />
                  </NoSSR>
                )}

                {/* iOS Safari Fixes */}
                <NoSSR>
                  <IOSSafariStyles />
                </NoSSR>
              </CookieProvider>
            </SettingsProvider>
          </ServerSettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
