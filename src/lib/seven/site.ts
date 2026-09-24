export const SITE_URL = "https://seven-nil-self.vercel.app";
export const SITE_NAME = "Seven Nil";
export const OG_IMAGE = `${SITE_URL}/og.jpg`;
export const CONTACT_EMAIL = "sagnik.dhar2018@gmail.com";
export const UPDATED = "2026-09-24";
export const GITHUB = "https://github.com/sagnikdhar2018-jpg/seven-nil";

export const orgRef = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#org`,
  name: SITE_NAME,
  url: SITE_URL,
  email: CONTACT_EMAIL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/favicon.svg`,
  },
  sameAs: [GITHUB],
  description:
    "Seven Nil is an independent browser game for drafting historic World Cup and club XIs and simulating the run.",
};

export const personRef = {
  "@type": "Person",
  "@id": `${SITE_URL}/#maker`,
  name: "Sagnik Dhar",
  email: CONTACT_EMAIL,
  url: `${SITE_URL}/about`,
  jobTitle: "Independent game maker",
  worksFor: { "@id": `${SITE_URL}/#org` },
  sameAs: ["https://github.com/sagnikdhar2018-jpg"],
};

export function pageHead({
  title,
  description,
  path,
  schemas = [],
}: {
  title: string;
  description: string;
  path: string;
  schemas?: object[];
}) {
  const url = `${SITE_URL}${path === "/" ? "" : path}`;
  const graph = [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        ...(path === "/" ? [] : [{ "@type": "ListItem", position: 2, name: title, item: url }]),
      ],
    },
    ...schemas,
  ];
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:type", content: "website" },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }),
      },
    ],
  };
}
