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
      <h2 className="mt-4 font-display text-2xl tracking-wide">Your use</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Do not attack the site, scrape it in a way that knocks it over, or upload anything illegal in a name field.</li>
        <li>Friends rooms are temporary. Do not put private information in a display name.</li>
        <li>Ads may appear. They are not endorsements.</li>
      </ul>
      <h2 className="mt-4 font-display text-2xl tracking-wide">Rooms</h2>
      <p>
        A friends room is temporary and shared only with the people who have the code. Do not put a phone number, an
        address, or anyone else's private information in a display name. The host of an organised cup can remove a
        seat. A password, if the host set one, is checked before you enter. We do not run accounts, and we do not
        promise that a room survives a closed laptop.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">Advertising</h2>
      <p>
        One Google AdSense script may load. An advertisement, if Google serves one, is not part of the draft and not
        an endorsement of a player, a club, or a score. Do not click an ad because a page asked you to. Nothing in
        the game does. Blocking the script does not remove your right to play.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">The result on the screen</h2>
      <p>
        A simulated score is entertainment. It is not a forecast, a betting tip, or a result from a real competition.
        Quoting it as one of those is a misuse of the site. The rating beside a name is a judgement for that year
        inside this game. It is not a FIFA, EA, or league official number.
      </p>
      <p>
        © 2026 Seven Nil. The game, the rating model, and the pages on this site are ours. All rights reserved in
        that work. Names of players, clubs, and competitions are used so a season can be recognised. They are not our
        trademarks, and this notice is not a claim over them. You may not copy the site into another product and
        present those ratings as official.
      </p>
      <p>
        The site does not host adult content, pirated video, illegal downloads, scraped articles, hate, or
        instructions for harm. Simulated violence is a football score, not a depiction of real harm. If you see a
        name field being used to abuse someone, write to{" "}
        <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
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
