import { createFileRoute } from "@tanstack/react-router";
import { LegalShell } from "@/components/seven/legal-shell";
import { CONTACT_EMAIL, GITHUB, SITE_URL, UPDATED, pageHead } from "@/lib/seven/site";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () =>
    pageHead({
      title: "About Seven Nil — World Cup draft game",
      description:
        "Seven Nil is a free World Cup and club draft XI game made by Sagnik Dhar. Roll a historic squad, pick eleven, and simulate the campaign.",
      path: "/about",
      schemas: [
        {
          "@type": "Article",
          headline: "About Seven Nil",
          datePublished: "2026-09-01",
          dateModified: UPDATED,
          author: { "@id": `${SITE_URL}/#maker` },
          publisher: { "@id": `${SITE_URL}/#org` },
          mainEntityOfPage: `${SITE_URL}/about`,
        },
      ],
    }),
});

function AboutPage() {
  return (
    <LegalShell title="About Seven Nil" kicker="Last updated September 2026">
      <p>
        Seven Nil is a free browser game for drafting a historic football XI. You roll one real squad and one year,
        take one player who fits an open role, and simulate the run. That is the whole product.
      </p>
      <h2 id="purpose" className="mt-4 font-display text-2xl tracking-wide">Why it exists</h2>
      <p>
        The purpose is a short argument you can finish in one sitting. Brazil 1970, France 1998, Spain 2010, a
        full-back from a smaller year. The name is the scoreline people remember and almost never land: 7–0.
        Champions, unbeaten, and nothing conceded.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">Who makes it</h2>
      <p>
        Sagnik Dhar makes Seven Nil independently. There is no studio, no office, and no phone line. The public record
        of the code is on{" "}
        <a className="underline" href={GITHUB} rel="me">
          GitHub
        </a>
        . Email{" "}
        <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>{" "}
        or use the{" "}
        <a className="underline" href="/contact">
          contact page
        </a>
        .
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">How a rating is set</h2>
      <p>
        A number is that tournament or that league season, not a career badge. The scale runs from the low 70s for a
        squad role or a poor year to the mid-90s for a defining one. The game holds 53 national squads and 73 club
        seasons, 1,520 ratings in all. Names above 90 are shown in gold.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">What it is not</h2>
      <p>
        Not affiliated with{" "}
        <a className="underline" href="https://en.wikipedia.org/wiki/FIFA">
          FIFA
        </a>
        ,{" "}
        <a className="underline" href="https://en.wikipedia.org/wiki/UEFA">
          UEFA
        </a>
        , or any club or league. Squads are compiled for a historical draft, not as official rosters. The shape of the
        cup follows the{" "}
        <a className="underline" href="https://en.wikipedia.org/wiki/FIFA_World_Cup">
          World Cup
        </a>{" "}
        and the{" "}
        <a className="underline" href="https://en.wikipedia.org/wiki/UEFA_Champions_League">
          Champions League
        </a>
        , which are their competitions, not this one.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">How to start</h2>
      <ol className="list-decimal space-y-1 pl-5">
        <li>
          Open the <a className="underline" href="/">World Cup draft</a> or the{" "}
          <a className="underline" href="/club">club draft</a>.
        </li>
        <li>Roll, pick one player, and fill the formation. You get five redraws.</li>
        <li>
          Play with someone else from <a className="underline" href="/friends">Friends</a> or{" "}
          <a className="underline" href="/club/friends">Club friends</a>.
        </li>
      </ol>
      <p>
        The steps are written out on <a className="underline" href="/how-to-play">How to play</a>. Privacy and terms
        sit in the footer.
      </p>
    </LegalShell>
  );
}
