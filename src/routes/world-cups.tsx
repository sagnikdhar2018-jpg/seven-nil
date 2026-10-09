import { createFileRoute } from "@tanstack/react-router";
import { LegalShell } from "@/components/seven/legal-shell";
import { SITE_URL, pageHead } from "@/lib/seven/site";

export const Route = createFileRoute("/world-cups")({
  component: WorldCupsPage,
  head: () =>
    pageHead({
      title: "World Cups in the Seven Nil draft",
      description:
        "Which national tournaments Seven Nil uses, from Brazil 1958 and 1970 to Argentina 2022, and what each squad is for in the draft.",
      path: "/world-cups",
      schemas: [
        {
          "@type": "Article",
          headline: "World Cups in the Seven Nil draft",
          datePublished: "2026-10-01",
          dateModified: "2026-10-09",
          author: { "@id": `${SITE_URL}/#maker` },
          publisher: { "@id": `${SITE_URL}/#org` },
          mainEntityOfPage: `${SITE_URL}/world-cups`,
        },
      ],
    }),
});

function WorldCupsPage() {
  return (
    <LegalShell title="World Cups in the draft" kicker="How a national roll is meant to be used">
      <p>
        This page is a set of draft rules written for Seven Nil. It is not a retelling of tournaments, not a match
        report, and not text lifted from a results site. A roll gives you one country and one year. You may take one
        player who fits an open role. Then that squad leaves. The notes below are about that decision.
      </p>
      <p>
        World Cup mode never draws a club. Club mode never draws a country. The two pools do not share a card, a room,
        or a friends lobby. Nothing here is affiliated with FIFA. The game does not host video, highlights, or any
        copy of a broadcast.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">What you are actually choosing</h2>
      <p>
        The famous name is usually the trap. Brazil 1970 contains several forwards a highlight reel would take first.
        If your 4-3-3 already has two of those roles filled, the useful shirt on that card is the right-back or the
        goalkeeper, because the formation still has a hole and the next roll may be a side with no full-back you can
        use. The same test applies to every champion attack in the archive.
      </p>
      <p>
        A second year of the same country is a different card, not a duplicate. Brazil 1958, 1970, 1982, 1994, 1998,
        and 2002 do not share a rating, and a player already taken cannot be taken again from another year. The card
        goes grey and the line under it says it cannot be selected. Another cup keeps the country and spends one of
        five redraws to change the year. Another team spends a redraw and leaves the country.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">How to read a strong year</h2>
      <p>
        Argentina 1986 is a one-player swing. If the open role can hold Maradona, that is the pick, because almost no
        later roll replaces what that card does in the hole. If the open role is a centre-back, ignore the 97 and take
        the defender, or redraw. Argentina 1978, 2014, and 2022 are not smaller copies of 1986. 1978 is a side without
        a single genius. 2022 has a goalkeeper and a midfield you can build around if the attack is already solved.
      </p>
      <p>
        Spain 2008, 2010, and 2012 look alike from outside the game and behave differently inside it. 2010 is the
        World Cup card, heavy through the middle. If you already have a holder, the scarce piece is often a full-back,
        not a third passer. France 1998, 2006, 2018, and 2022 are four generations. Taking the 1998 striker does not
        unlock the 2018 full-backs. Germany 1974, 1990, and 2014 are the same rule: Beckenbauer's card can defend or
        sit in front of the defence, which is why a formation change after the coach arrives may move him. It does
        not move a pure striker into a full-back slot.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">How to read a thin year</h2>
      <p>
        Greece 2004 and Costa Rica 2014 are in the archive because a draft of only champions never asks you to solve
        a goalkeeper. On Greece, the honest pick is Nikopolidis or a centre-back if that role is empty. There is no
        hidden gold forward on that card. Forcing one is how the XI finishes with three number 10s and an empty
        spine. Denmark 1992, Bulgaria 1994, and Cameroon 1990 work the same way: one or two players are the point of
        the roll, and the rest are squad roles in the low 70s or low 80s on purpose.
      </p>
      <p>
        Morocco 2022 is the opposite of a star-forward card. The value is the back line and the midfield. Japan 2022,
        Korea 2002, the United States in 2022, and Mexico in 1986 are included so a left-back problem can be answered
        by a side that actually used one. If the timer expires, the game auto-picks a legal player for the open role.
        It will not hand you a forward you cannot place.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">A full turn, written out</h2>
      <p>
        Formation 4-3-3. First roll, Brazil 1970. Attack is already famous, so the pick is Carlos Alberto if
        right-back is empty. Second roll, Greece 2004. Stoichkov is not in that squad. If the goal is empty, take
        Nikopolidis. If the goal is filled, redraw. Another team spends one chance. Another cup on Greece changes
        nothing if that country has one year in the archive, so the redraw is wasted unless you leave the country.
        After eleven shirts, the coach is offered. Three changes. The coach does not take a place in the XI.
      </p>
      <p>
        The number on each of those cards is a judgment for that year inside this game. The method is on{" "}
        <a className="underline" href="/ratings">How a rating is set</a>. Where the names stop and the invention
        starts is on <a className="underline" href="/sources">Sources</a>. Club years are a separate pool:{" "}
        <a className="underline" href="/club-seasons">Club seasons</a>.
      </p>
    </LegalShell>
  );
}
