import { createFileRoute } from "@tanstack/react-router";
import { LegalShell } from "@/components/seven/legal-shell";
import { CONTACT_EMAIL, GITHUB, SITE_URL, UPDATED, pageHead } from "@/lib/seven/site";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () =>
    pageHead({
      title: "About Seven Nil — World Cup draft game",
      description:
        "Seven Nil is a free World Cup and club draft XI game made by nik.peeps. Roll a historic squad, pick eleven, and simulate the campaign.",
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
        nik.peeps makes Seven Nil independently, and is not a club analyst and does not sell scouting reports. The
        work is the game: the draft rules, the season ratings, and the simulation. The public code is on{" "}
        <a className="underline" href={GITHUB} rel="me">
          GitHub
        </a>
        . That profile is the only social record for the project. There is no company page, no office, and no phone.
      </p>
      <p>
        Email{" "}
        <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>{" "}
        or use the{" "}
        <a className="underline" href="/contact">
          contact page
        </a>
        . A wrong year, a missing shirt, or a room that will not start is the useful note.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">How a rating is set</h2>
      <p>
        Each number is that tournament or that league season. It is not a career peak. The scale sits in the low 70s
        for a squad role or a poor year and in the mid-90s for a defining one. Names above 90 are shown in gold so a
        true standout is obvious and a famous name in a quiet year is not.
      </p>
      <p>
        The archive is finite on purpose. Seven Nil holds 53 national squads and 73 club seasons. That is 1,520
        ratings. Club mode stays inside England, Spain, Italy, Germany, and France from 1980 on. World Cup mode never
        draws a club. Club mode never draws a country.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">How a match is decided</h2>
      <p>
        The XI is scored as attack, midfield, and defence, plus how well the players fit the roles. A stronger side
        is more likely to go through. It is not guaranteed. Friends matches between two people are played minute by
        minute, including a penalty shootout if the score is level. Every other tie in the bracket is settled at once
        so a 32-team cup does not take an hour.
      </p>
      <p>
        You get five redraws. Choosing another year of the same side, or a different side, spends one. Names can be
        edited in the lobby, before the draft starts, and not after.
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
