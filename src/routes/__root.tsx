import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { OG_IMAGE, SITE_NAME, SITE_URL, orgRef, personRef } from "@/lib/seven/site";
import appCss from "../styles.css?url";

const APP_NAME = "Seven Nil";
const ADSENSE_CLIENT = "ca-pub-1391099021196311";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    orgRef,
    personRef,
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      publisher: { "@id": `${SITE_URL}/#org` },
      inLanguage: "en",
    },
    {
      "@type": ["VideoGame", "WebApplication"],
      "@id": `${SITE_URL}/#game`,
      name: SITE_NAME,
      url: SITE_URL,
      applicationCategory: "GameApplication",
      operatingSystem: "Web browser",
      gamePlatform: "Web browser",
      playMode: ["SinglePlayer", "MultiPlayer"],
      numberOfPlayers: { "@type": "QuantitativeValue", minValue: 1, maxValue: 32 },
      genre: "Sports",
      inLanguage: "en",
      isAccessibleForFree: true,
      description:
        "Free World Cup draft game. Roll a historic national squad, pick an XI, and simulate the tournament. Club mode covers the top five leagues from 1980.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      image: OG_IMAGE,
      publisher: { "@id": `${SITE_URL}/#org` },
      author: { "@id": `${SITE_URL}/#maker` },
    },
  ],
};

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      {
        name: "description",
        content:
          "Free World Cup draft game. Roll a nation and a year, pick one player at a time, and simulate the run. Club mode and Friends cups included.",
      },
      { name: "theme-color", content: "#1f6c37" },
      { name: "google-adsense-account", content: ADSENSE_CLIENT },
      { name: "robots", content: "index,follow" },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:type", content: "website" },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [
      { rel: "canonical", href: SITE_URL },
      { rel: "icon", href: "/favicon.ico", sizes: "48x48" },
      { rel: "icon", type: "image/png", href: "/favicon-192.png", sizes: "192x192" },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "stylesheet", href: appCss, fetchPriority: "high" },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
    ],
    scripts: [
      {
        children: `(function(){var id='${ADSENSE_CLIENT}';function load(){if(document.querySelector('script[data-ads]'))return;var s=document.createElement('script');s.async=true;s.dataset.ads='1';s.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client='+id;s.crossOrigin='anonymous';document.head.appendChild(s);}window.addEventListener('load',function(){setTimeout(load,2500);});})();`,
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(jsonLd),
      },
    ],
  }),
  component: () => (
    <html lang="en" className="antialiased theme-panini" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{var s=JSON.parse(localStorage.getItem("seven-nil-save")||"{}");if(s.theme==="terrace"){var h=document.documentElement;h.classList.remove("theme-panini");h.classList.add("theme-terrace");}}catch(e){}})();',
          }}
        />
      </head>
      <body className="bg-paper text-ink">
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <PreviewHostBridge />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
