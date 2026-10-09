import { createFileRoute } from "@tanstack/react-router";
import { LegalShell } from "@/components/seven/legal-shell";
import { archiveCounts } from "@/lib/seven/squads";
import { SITE_URL, pageHead } from "@/lib/seven/site";

export const Route = createFileRoute("/guides")({
  component: GuidesPage,
  head: () =>
    pageHead({
      title: "Seven Nil guides — World Cup drafts, ratings, and club seasons",
      description:
        "Original guides for Seven Nil: how a season rating is set, which World Cups are in the draft, and which club seasons from 1980 are playable.",
      path: "/guides",
      schemas: [
        {
          "@type": "CollectionPage",
          name: "Seven Nil guides",
          url: `${SITE_URL}/guides`,
          description: "Written guides for the Seven Nil historic football draft.",
        },
      ],
    }),
});

function GuidesPage() {
  const archive = archiveCounts();
  const ratingLabel = archive.ratings.toLocaleString("en-US");
  return (
    <LegalShell title="Guides" kicker="Read before you roll">
      <p>
        Seven Nil is a draft you play, and it is also a written record of the squads that draft uses. These pages
        explain the rules, the ratings, and the seasons. They are original notes for this game. They are not match
        reports copied from a newspaper, and they are not an official history of any competition.
      </p>
      <p>
        The board currently holds {archive.nations} national tournament squads and {archive.clubs} club seasons. That
        is {ratingLabel} player ratings. A number always means that year. A famous name in a quiet tournament is not
        given a career score just because the name is famous.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">Start here</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <a className="underline" href="/how-to-play">
            How to play
          </a>
          . Formations, redraws, friends rooms, penalties, and the difference between a World Cup board and a club
          board.
        </li>
        <li>
          <a className="underline" href="/ratings">
            How a rating is set
          </a>
          . The scale, gold names, chemistry, and why a manager changes link-up without rewriting a player's
          number.
        </li>
        <li>
          <a className="underline" href="/world-cups">
            World Cups in the draft
          </a>
          . What each national side in the archive is doing in that tournament, from 1958 through the recent cups.
        </li>
        <li>
          <a className="underline" href="/club-seasons">
            Club seasons from 1980
          </a>
          . Title sides and a few famous runs from England, Spain, Italy, Germany, and France.
        </li>
      </ul>
      <h2 className="mt-4 font-display text-2xl tracking-wide">What the draft is for</h2>
      <p>
        You do not search a database and pick Pelé whenever you want. A turn gives you one squad. You take one player
        who fits an open role, then that squad leaves the table. The constraint is the game. A 4-4-2 that still needs
        a left-back cannot spend the turn on a second striker, however high the number next to that striker is.
      </p>
      <p>
        You get five redraws. Another year of the same side spends one. A different side spends one. After the draft
        starts, the display name is locked. The manager is offered at the end, not as a free extra shirt in the XI.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">What a match uses</h2>
      <p>
        The eleven is read as attack, midfield, and defence, plus how well each player fits the role you put them in.
        Chemistry looks at shared nation and year, and at whether neighbours can actually play together. A manager
        adds link-up. That lift is real in the simulation. It does not turn a weak XI into a great one by itself.
      </p>
      <p>
        A stronger side is more likely to go through. It is not guaranteed. Friends matches between two people are
        played minute by minute, and a draw is settled by penalties, one kick at a time. Every other tie in a bracket
        is settled at once, so a 32-team cup does not take an hour. Later rounds stay closed until the live match is
        finished.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">How these pages are written</h2>
      <p>
        The sentences on this site were written for Seven Nil. They describe the draft, the season scores, and the
        choices a roll forces. They are not match reports copied from a newspaper, not squad lists pasted from
        another site, and not a spun version of a public encyclopedia. A name and a year identify a real squad. The
        rating, the chemistry, and the simulated score are original to the game. If a year is wrong, the correction
        is the squad, the year, and the name, sent from the{" "}
        <a className="underline" href="/contact">contact page</a>.
      </p>
      <p>
        The site does not publish adult material, pirated video, scraped articles, hate, or instructions for
        anything dangerous. It also does not sell bets. The legal version of that rule is on the{" "}
        <a className="underline" href="/terms">terms</a>.
      </p>
      <p>
        Seven Nil is not affiliated with FIFA, UEFA, or any club or league. It does not sell bets, tips, or packs.
        There is no account. Drafts stay on your device unless you join a friends room, and a friends room only shares
        the code, the names, and the picks with the people in that room. Advertising, if Google approves the site, is
        explained on the <a className="underline" href="/privacy">privacy policy</a>.
      </p>
      <p>
        If a year is wrong or a shirt is missing, use the <a className="underline" href="/contact">contact page</a>.
        The useful note is the squad, the year, and the name.
      </p>
    </LegalShell>
  );
}
