import { createFileRoute } from "@tanstack/react-router";
import { LegalShell } from "@/components/seven/legal-shell";
import { SITE_URL, pageHead } from "@/lib/seven/site";

export const Route = createFileRoute("/club-seasons")({
  component: ClubSeasonsPage,
  head: () =>
    pageHead({
      title: "Club seasons in Seven Nil — top five leagues since 1980",
      description:
        "The club draft uses title seasons and famous runs from England, Spain, Italy, Germany, and France, starting in 1980. World Cup squads never appear here.",
      path: "/club-seasons",
      schemas: [
        {
          "@type": "Article",
          headline: "Club seasons in the Seven Nil draft",
          datePublished: "2026-10-01",
          dateModified: "2026-10-09",
          author: { "@id": `${SITE_URL}/#maker` },
          publisher: { "@id": `${SITE_URL}/#org` },
          mainEntityOfPage: `${SITE_URL}/club-seasons`,
        },
      ],
    }),
});

function ClubSeasonsPage() {
  return (
    <LegalShell title="Club seasons from 1980" kicker="How a club roll is meant to be used">
      <p>
        Club mode is a second game, not a chapter of the World Cup draft. A roll is one club and one season from
        England, Spain, Italy, Germany, or France, and only from 1980 onward. You take one player who fits an open
        role. National teams never appear in this pool, and these clubs never appear in a World Cup room.
      </p>
      <p>
        The pages on this site do not copy season reviews, squad lists, or club sites. A name and a year are the
        record. The number beside the name, the chemistry, and the simulated score are written for Seven Nil. There
        is no video, no ripped footage, and no betting market.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">Same badge, different card</h2>
      <p>
        Real Madrid 2014, 2015, 2016, and 2017 are stored as four squads. Taking a forward from 2014 does not unlock
        the 2017 bench, and that player cannot be drafted again from a later year. The later card is marked and
        cannot be selected. Another season spends one redraw and stays on Real Madrid. Another club spends a redraw
        and leaves. Barcelona 2006 and Barcelona 2015 fail the same test people apply by memory: 2006 is not the
        2015 front three with younger faces. If you wanted the later attack, Another season is the button. If you
        only needed a full-back, take the full-back from the year you were given.
      </p>
      <p>
        Liverpool 2005 and Liverpool 2019 are the clearest pair. 2005 is the Istanbul season, with one midfielder
        rated far above the rest of that card. 2019 is a league side whose strength is the centre-back and the
        forward line together. Stacking both is legal. Treating them as one squad is not, because chemistry only
        bonds players who share the club and the year, plus neighbours whose roles actually connect.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">What was left out, and why</h2>
      <p>
        Mid-table seasons are omitted on purpose. A roll is supposed to mean a title side, a European run, or the
        best version of that club. Leicester 2016 is in because a pool of only the same five superclubs never makes
        you draft a title winger from outside them. Deportivo 2000, Valencia 2004, Kaiserslautern 1998, and Lille
        2021 are in for the same design reason. They are not there as a scraped table of every champion since 1980.
      </p>
      <p>
        England in the file runs from the old First Division into the Premier League: Forest 1980, the Liverpool
        sides, United's title years, Arsenal 1989 and 2004, Chelsea's separate manager-peaks, City 2012 against
        the later City teams. Spain keeps Madrid and Barcelona in slices, plus Atlético as a defensive champion
        rather than a copy of Madrid. Italy keeps the Milan, Juventus, Inter, Napoli, and Roma peaks as separate
        seasons, so Napoli 1990 is not Napoli 2023. Germany and France do the same with Bayern, Dortmund, Marseille,
        Lyon, Monaco, and Paris.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">A club turn</h2>
      <p>
        Formation 4-3-3, attack already filled, roll is Atlético 2014. The glamour name is usually the forward. The
        open role is a centre-back, so Godín is the pick and the forward is a miss. If the dice then offer Barcelona
        2015 and the striker role is full, do not take a second striker. Take the full-back or redraw. Five redraws
        cover the whole draft. A manager comes last, with three changes, and only adds link-up to players who already
        share something. Eleven strangers from eleven clubs stay a low-chemistry side.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">A club turn, counted</h2>
      <p>
        Five redraws. That is the whole budget, not five per roll. Another season and another club both spend one.
        A player already taken is grey on every later card, including a different year of the same club. The timer
        auto-picks a legal shirt, not the highest number on the page.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr>
              <th className="border-b border-ink/20 py-2 pr-3">You press</th>
              <th className="border-b border-ink/20 py-2 pr-3">Cost</th>
              <th className="border-b border-ink/20 py-2">What stays</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border-b border-ink/10 py-2 pr-3">Another season</td>
              <td className="border-b border-ink/10 py-2 pr-3">1 redraw</td>
              <td className="border-b border-ink/10 py-2">The club. The year changes. The 2014 squad is not the 2017 squad.</td>
            </tr>
            <tr>
              <td className="border-b border-ink/10 py-2 pr-3">Another club</td>
              <td className="border-b border-ink/10 py-2 pr-3">1 redraw</td>
              <td className="border-b border-ink/10 py-2">Nothing from the previous card. The pool is still clubs only.</td>
            </tr>
            <tr>
              <td className="py-2 pr-3">Take a player</td>
              <td className="py-2 pr-3">None</td>
              <td className="py-2">That person is gone for the rest of the draft, every year.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Chemistry does not treat "same badge" as "same team". Liverpool 2005 and Liverpool 2019 can both be in your
        XI. They do not get the shared-year bond. Neighbours still add a little if a full-back sits beside a winger
        whose role actually connects. The manager, last, lifts link-up. The lift is larger when some bonds already
        exist. Stacking eleven clubs from eleven years stays a low-chemistry side no matter which coach you land.
        The rating rule is on <a className="underline" href="/ratings">How a rating is set</a>. What is a fact and
        what is a judgement is on <a className="underline" href="/sources">Sources</a>. National years are on{" "}
        <a className="underline" href="/world-cups">World Cups in the draft</a>.
      </p>
    </LegalShell>
  );
}
