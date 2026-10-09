import { createFileRoute } from "@tanstack/react-router";
import { LegalShell } from "@/components/seven/legal-shell";
import { SITE_URL, pageHead } from "@/lib/seven/site";

export const Route = createFileRoute("/sources")({
  component: SourcesPage,
  head: () =>
    pageHead({
      title: "Sources — what Seven Nil takes from the record, and what it invents",
      description:
        "Seven Nil uses real tournament years and real squads as the draft pool. The ratings, chemistry, and match results are original to the game, not official statistics.",
      path: "/sources",
      schemas: [
        {
          "@type": "Article",
          headline: "Sources for the Seven Nil draft",
          datePublished: "2026-10-06",
          dateModified: "2026-10-09",
          author: { "@id": `${SITE_URL}/#maker` },
          publisher: { "@id": `${SITE_URL}/#org` },
          mainEntityOfPage: `${SITE_URL}/sources`,
        },
      ],
    }),
});

function SourcesPage() {
  return (
    <LegalShell title="Sources" kicker="The record, then the game">
      <p>
        Two different things sit on a Seven Nil card. The name, the country or club, the year, and the role are taken
        from a real tournament or a real league season. The number beside the name, the chemistry, and every score
        the simulator prints are original to this game. They are not a FIFA rating, a league table, or a betting
        price.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">What is taken from the record</h2>
      <p>
        A national card is a World Cup or a European Championship year people still argue about. Brazil 1970 means
        the players who made that summer, not a fantasy Brazil. A club card is one season from 1980 onward in the
        English, Spanish, Italian, German, or French top division: a title side, a European run, or the best version
        of that club. Shirt numbers follow the tournament or the season when a number is well known.
      </p>
      <p>
        The public record used to check those squads is the usual one: contemporary lineups, tournament squads, and
        reference pages such as{" "}
        <a className="underline" href="https://en.wikipedia.org/wiki/FIFA_World_Cup">
          the World Cup
        </a>
        ,{" "}
        <a className="underline" href="https://en.wikipedia.org/wiki/UEFA_Champions_League">
          the European Cup
        </a>
        , and the season pages of the clubs. Seven Nil does not copy those articles onto this site. It keeps a short
        squad, the year, and a role, then writes its own notes. The reading lives on{" "}
        <a className="underline" href="/world-cups">
          World Cups
        </a>{" "}
        and{" "}
        <a className="underline" href="/club-seasons">
          club seasons
        </a>
        .
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">What is original</h2>
      <p>
        The overall is a judgement of that year inside this game. A low-70s card is a squad role or a poor year. A
        mid-90s card is a summer or a season that still organises how people talk about that team. Pelé in 1970 and a
        famous name who barely played are different numbers on purpose. Nothing here is licensed from EA, FIFA, or a
        data company.
      </p>
      <p>
        Chemistry is also original. It looks at shared nation and year, and at whether two neighbours can actually
        play together. The manager adds a link-up lift. That formula is described on{" "}
        <a className="underline" href="/ratings">
          How a rating is set
        </a>
        . A match result is then a chance built from attack, midfield, defence, the goalkeeper, fit, and that
        chemistry. It is not a replay of the real final.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">What this site does not claim</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>It is not affiliated with FIFA, UEFA, or any club or league.</li>
        <li>A simulated 2–1 is not a prediction and not a tip.</li>
        <li>A gold name is a display rule for 91 and above. It is not an official award.</li>
        <li>If a shirt or a year is wrong, that is a correction, not a statistic. Write the squad, the year, and the name on the <a className="underline" href="/contact">contact page</a>.</li>
      </ul>
      <h2 className="mt-4 font-display text-2xl tracking-wide">How to read a card</h2>
      <p>
        Split every line into three piles. The first pile is a fact we tried to keep: the person played for that side
        in that year, in a role close to the one on the card. The second pile is a judgement: the overall. The third
        pile is a simulation: chemistry, the manager's lift, and the score. Mixing the piles is how a 2–1 gets quoted
        as if it happened.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr>
              <th className="border-b border-ink/20 py-2 pr-3">On the card</th>
              <th className="border-b border-ink/20 py-2 pr-3">Kind</th>
              <th className="border-b border-ink/20 py-2">What it is allowed to mean</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border-b border-ink/10 py-2 pr-3">Name, side, year, role</td>
              <td className="border-b border-ink/10 py-2 pr-3">Record</td>
              <td className="border-b border-ink/10 py-2">Checked against tournament and season squads. Send a correction if a shirt is wrong.</td>
            </tr>
            <tr>
              <td className="border-b border-ink/10 py-2 pr-3">Overall, gold text</td>
              <td className="border-b border-ink/10 py-2 pr-3">Judgement</td>
              <td className="border-b border-ink/10 py-2">That year inside this game. Gold is the display for a number above 90. Not an official rating.</td>
            </tr>
            <tr>
              <td className="py-2 pr-3">Chemistry, manager, score</td>
              <td className="py-2 pr-3">Simulation</td>
              <td className="py-2">A chance from the XI you drafted. Not a replay and not a tip.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Wikipedia and club season pages are used as a map of who was there. They are not copied onto this site, and a
        sentence on those pages is not a source for the overall. If two public lists disagree about a squad number,
        the game keeps both names and moves the duplicate number so the cards stay distinct. The name is the record.
        The number is a label.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">A correction, not a new history</h2>
      <p>
        If Pelé is on a year he did not play, or a 2014 full-back has been given a 2017 squad-mate's number, that is
        a mistake in the record pile. The note that fixes it is the side, the year, and the name. The overall is not
        corrected by pasting a paragraph from a season review. Two people can disagree about a 86 and an 88. That
        disagreement is a judgement. It is welcome on the <a className="underline" href="/contact">contact page</a>,
        and it does not turn the number into an official statistic.
      </p>
      <p>
        The archive stays finite for the same reason. A roll is supposed to mean a side people can still picture. A
        mid-table season with no claim on that season is left out on purpose, not because a source failed to list
        it. National cards and club cards never share a pool. A World Cup friends room cannot draft a club XI, and a
        club room cannot draft a country.
      </p>
    </LegalShell>
  );
}
