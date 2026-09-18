import { createFileRoute } from "@tanstack/react-router";
import { LegalShell } from "@/components/seven/legal-shell";
import { pageHead } from "@/lib/seven/site";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () =>
    pageHead({
      title: "About Seven Nil — World Cup draft game",
      description:
        "Seven Nil is a free World Cup and club draft XI game. Roll a historic squad, pick eleven, and simulate the campaign.",
      path: "/about",
    }),
});

function AboutPage() {
  return (
    <LegalShell title="About Seven Nil" kicker="A draft, not a licensed product">
      <p>
        Seven Nil is a free World Cup draft game. You roll a nation and a tournament year, claim one real player at a
        time, lock an XI, and simulate the run. Club mode does the same with sides from England, Spain, Italy, Germany,
        and France from 1980 on.
      </p>
      <p>
        The name is the scoreline everyone remembers and almost nobody lands: 7–0. The game is a toy for people who
        argue about Brazil 1970, France 1998, Spain 2010, and whether a full-back from an underdog year can still
        carry a tournament.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">What it is not</h2>
      <p>
        Not affiliated with FIFA, UEFA, or any club or league. Squads are compiled for a historical draft, not as
        official licensed rosters. Names and years are used descriptively.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">How to start</h2>
      <p>
        Open the{" "}
        <a className="underline" href="/">
          World Cup draft
        </a>
        , the{" "}
        <a className="underline" href="/club">
          club draft
        </a>
        , or{" "}
        <a className="underline" href="/friends">
          Friends
        </a>{" "}
        for local and online cups. A short{" "}
        <a className="underline" href="/how-to-play">
          how to play
        </a>{" "}
        guide covers roll, pick, place, and simulate.
      </p>
    </LegalShell>
  );
}
