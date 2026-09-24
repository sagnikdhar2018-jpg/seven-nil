import { createFileRoute } from "@tanstack/react-router";
import { SevenApp } from "@/components/seven/seven-app";
import { WORLD_FAQ } from "@/components/seven/guide";
import { SITE_URL, UPDATED, faqSchema, itemListSchema, pageHead } from "@/lib/seven/site";

export const Route = createFileRoute("/")({
  component: Home,
  head: () =>
    pageHead({
      title: "Seven Nil — Free World Cup draft game",
      description:
        "Seven Nil is a free World Cup draft. Roll a nation and a year, pick one real player at a time, and simulate the tournament.",
      path: "/",
      schemas: [
        faqSchema(WORLD_FAQ),
        itemListSchema("Seven Nil modes", [
          { name: "World Cup", url: SITE_URL, description: "One nation, one tournament year" },
          { name: "Clubs", url: `${SITE_URL}/club`, description: "One top-five club, one season from 1980" },
          { name: "Friends", url: `${SITE_URL}/friends`, description: "A final, or a cup seeded by ranking" },
        ]),
        {
          "@type": "Article",
          headline: "Seven Nil — Free World Cup draft game",
          datePublished: "2026-09-01",
          dateModified: UPDATED,
          author: {
            "@type": "Person",
            name: "nik.peeps",
            jobTitle: "Independent game maker",
            url: `${SITE_URL}/about`,
            worksFor: { "@type": "Organization", name: "Seven Nil", url: SITE_URL },
          },
          publisher: { "@id": `${SITE_URL}/#org` },
          mainEntityOfPage: SITE_URL,
          speakable: {
            "@type": "SpeakableSpecification",
            cssSelector: ["#answer", ".home-headline"],
          },
        },
      ],
    }),
});

function Home() {
  return <SevenApp />;
}
