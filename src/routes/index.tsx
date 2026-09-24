import { createFileRoute } from "@tanstack/react-router";
import { SevenApp } from "@/components/seven/seven-app";
import { WORLD_FAQ } from "@/components/seven/guide";
import { SITE_URL, UPDATED, pageHead } from "@/lib/seven/site";

export const Route = createFileRoute("/")({
  component: Home,
  head: () =>
    pageHead({
      title: "Seven Nil — Free World Cup draft game",
      description:
        "Seven Nil is a free World Cup draft. Roll a nation and a year, pick one real player at a time, and simulate the tournament.",
      path: "/",
      schemas: [
        {
          "@type": "FAQPage",
          mainEntity: WORLD_FAQ.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        },
        {
          "@type": "Article",
          headline: "Seven Nil — Free World Cup draft game",
          datePublished: "2026-09-01",
          dateModified: UPDATED,
          author: { "@id": `${SITE_URL}/#maker` },
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
