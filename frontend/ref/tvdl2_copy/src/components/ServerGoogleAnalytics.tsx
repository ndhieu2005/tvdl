// Server-side Google Analytics component with direct script tags
export function ServerGoogleAnalytics({ gaId }: { gaId?: string | null }) {
  // Don't render if no valid GA ID
  if (!gaId || gaId === 'GA_MEASUREMENT_ID' || !gaId.startsWith('G-')) {
    return null;
  }

  return (
    <>
      {/* Google tag (gtag.js) */}
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}');
          `,
        }}
      />
    </>
  );
}