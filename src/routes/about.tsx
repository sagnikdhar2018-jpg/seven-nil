import { createFileRoute } from "@tanstack/react-router";
import { LegalShell } from "@/components/seven/legal-shell";
import { archiveCounts } from "@/lib/seven/squads";
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
  const archive = archiveCounts();
  const ratingLabel = archive.ratings.toLocaleString("en-US");
  return (
    <LegalShell title="About Seven Nil" kicker="Last updated October 2026">
      <p>
        Seven Nil is a free browser game for drafting a historic football XI. You roll one real squad and one year,
        take one player who fits an open role, and simulate the run. It is not a quiz, and it does not ask you to
        name a winner. The decision is which shirt the formation still needs.
      </p>
      <h2 id="purpose" className="mt-4 font-display text-2xl tracking-wide">Why it exists</h2>
      <p>
        A normal football quiz rewards memory of a score. This draft rewards a squad that can actually play. Brazil
        1970, France 1998, and Spain 2010 are full of famous forwards. The turn that matters is often the full-back
        from a smaller year, because the formation still has an empty role. The name of the game is the scoreline
        people remember and almost never land: 7–0. Champions, unbeaten, and nothing conceded.
      </p>
      <p>
        nik.peeps built it as a short argument you can finish in one sitting. There is no pack shop and no account.
        The public rules, the season ratings, and the match model are the product.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">What makes it different</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>You do not search the archive. One squad appears, you take one player, and that squad leaves.</li>
        <li>A famous name is useless if the open role is a left-back they cannot play.</li>
        <li>The number on the card is that tournament or that league season, not a career peak.</li>
        <li>A stronger XI is more likely to win. It is not scripted to win.</li>
        <li>World Cup drafts and club drafts never share a player pool.</li>
      </ul>
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
        The archive is finite on purpose. Seven Nil holds {archive.nations} national squads and {archive.clubs} club
        seasons. That is {ratingLabel} ratings. Club mode stays inside England, Spain, Italy, Germany, and France from
        1980 on. World Cup mode never draws a club. Club mode never draws a country.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">How the simulation works</h2>
      <p>
        The eleven is split into attack, midfield, and defence. Each band is the players in those roles, adjusted for
        whether the shirt fits them. The goalkeeper is separate. Chemistry asks whether neighbours shared a nation and
        a year, and whether their roles actually connect. The manager, chosen last, adds link-up play. That raises a
        side that already has some bonds. It does not turn strangers into a great team.
      </p>
      <p>
        Style changes the weighting. A defensive side spends more of its quality at the back. An attacking side spends
        it up front. The result is a chance. Two equal sides can split a tie. A much stronger side loses sometimes.
        Friends matches between two people are played minute by minute, including penalties one kick at a time. Every
        other tie in a bracket is settled at once, and the next round stays closed until the live match is finished.
      </p>
      <p>
        The full scale, gold names, and chemistry formula are on{" "}
        <a className="underline" href="/ratings">
          How a rating is set
        </a>
        . Where the names and years come from, and what is original to this game, is on{" "}
        <a className="underline" href="/sources">
          Sources
        </a>
        .
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
