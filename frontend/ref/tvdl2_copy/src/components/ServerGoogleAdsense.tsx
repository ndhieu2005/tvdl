// Server-side Google AdSense component
export function ServerGoogleAdsense({ adsenseId }: { adsenseId?: string | null }) {
  // Don't render if no valid AdSense ID
  if (!adsenseId || adsenseId === 'ca-pub-XXXXXXXXXXXXXXXX' || !adsenseId.startsWith('ca-pub-')) {
    return null;
  }

  return (
    <>
      {/* Google AdSense Script */}
      <script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
        crossOrigin="anonymous"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (adsbygoogle = window.adsbygoogle || []).push({
              google_ad_client: "${adsenseId}",
              enable_page_level_ads: true
            });
          `,
        }}
      />
    </>
  );
}