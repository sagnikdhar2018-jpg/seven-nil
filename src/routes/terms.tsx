import { createFileRoute } from "@tanstack/react-router";
import { LegalShell } from "@/components/seven/legal-shell";
import { CONTACT_EMAIL, pageHead } from "@/lib/seven/site";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () =>
    pageHead({
      title: "Terms of use — Seven Nil",
      description: "Seven Nil is a free unofficial draft game. You play it in the browser. Squads are descriptive, not licensed.",
      path: "/terms",
    }),
});

function TermsPage() {
  return (
    <LegalShell title="Terms of use" kicker="Last updated October 2026">
      <p>
        Seven Nil is a free game you play in the browser. By using it you accept these terms. If you do not, close the
        tab.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">The game</h2>
      <p>
        Rolls, ratings, and match results are a simulation. They are not a forecast, a betting tip, or an official
        record. Player scores describe that season inside the game, not a licensed rating.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">Names</h2>
      <p>
        Club names, tournament names, and player names are used so you can recognise a season. Seven Nil is not
        affiliated with FIFA, UEFA, or any club or league, and it does not sell their marks.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">What we do not publish</h2>
      <p>
        Seven Nil does not host adult content, pirated matches or software, scraped or spun articles, hate, or
        anything meant to hurt someone. The written pages explain this game. They are not copied match reports. Names
        of players and clubs are used so a season can be recognised. They are not a licence, and the site does not
        sell official footage or merchandise.
      </p>
      <ul className="list-disc space-y-1 pl-5">
        <li>Do not attack the site, scrape it in a way that knocks it over, or upload anything illegal in a name field.</li>
        <li>Friends rooms are temporary. Do not put private information in a display name.</li>
        <li>Ads may appear. They are not endorsements.</li>
      </ul>
      <h2 className="mt-4 font-display text-2xl tracking-wide">Liability</h2>
      <p>
        The game is provided as is. A lost draft, a dropped room, or a wrong score is not a claim for money. Write to{" "}
        <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>{" "}
        if something is broken.
      </p>
    </LegalShell>
  );
}
