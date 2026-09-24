import { createFileRoute } from "@tanstack/react-router";
import { LegalShell } from "@/components/seven/legal-shell";
import { SITE_URL, UPDATED, faqSchema, pageHead } from "@/lib/seven/site";

export const Route = createFileRoute("/how-to-play")({
  component: HowToPlayPage,
  head: () =>
    pageHead({
      title: "How to play Seven Nil — World Cup XI draft",
      description:
        "Learn the World Cup draft game: roll a historic squad, pick one player, place your XI, and simulate the tournament. Club mode and Friends cups included.",
      path: "/how-to-play",
      schemas: [
        {
          "@type": "HowTo",
          name: "How to play the World Cup draft",
          description:
            "Roll a real national team from a real tournament year, take one footballer, and repeat until eleven shirts are filled.",
          totalTime: "PT15M",
          dateModified: UPDATED,
          step: [
            {
              "@type": "HowToStep",
              position: 1,
              name: "Pick a formation and a style",
              text: "Classic keeps ratings visible. Almanac hides them.",
            },
            {
              "@type": "HowToStep",
              position: 2,
              name: "Roll",
              text: "A nation and a World Cup year appear, with the squad from that summer.",
            },
            {
              "@type": "HowToStep",
              position: 3,
              name: "Pick one player",
              text: "Take one player who fits an empty slot. You can redraw, including the same nation in another year.",
            },
            {
              "@type": "HowToStep",
              position: 4,
              name: "Place the eleven",
              text: "Confirm the XI. Simulate the group and knockout path.",
            },
          ],
          url: `${SITE_URL}/how-to-play`,
        },
        faqSchema([
          {
            q: "Is this an official FIFA game?",
            a: "No. It is an independent draft toy. Not affiliated with FIFA, UEFA, or any club.",
          },
          {
            q: "Do I need an account?",
            a: "No. Progress stays on your device. Friends only needs a display name.",
          },
          {
            q: "Can I keep the same team and change the year?",
            a: "Yes. After a roll, Another team draws a new side. Another cup keeps that side and changes the year. Clubs use Another club and Another season. Each one spends a re-roll.",
          },
        ]),
      ],
    }),
});

function HowToPlayPage() {
  return (
    <LegalShell title="How to play the World Cup draft" kicker="Roll · pick · place · simulate">
      <p>
        Seven Nil is a World Cup draft game you play in the browser. You do not buy packs. You roll a real national
        team from a real tournament year, then take one footballer from that squad. Repeat until eleven shirts are
        filled. Then the XI plays a simulated campaign.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">World Cup mode</h2>
      <ol className="list-decimal space-y-2 pl-5">
        <li>Pick a formation and a style. Classic keeps ratings visible. Almanac hides them.</li>
        <li>Roll. A nation and a World Cup year appear, with the squad from that summer.</li>
        <li>Pick one player who fits an empty slot. You can redraw, including the same nation in another year.</li>
        <li>Place the eleven. Confirm the XI. Simulate the group and knockout path.</li>
      </ol>
      <p>
        Start here:{" "}
        <a className="underline" href="/">
          Play the World Cup draft
        </a>
        .
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">Club mode</h2>
      <p>
        Club mode is separate. It rolls historic sides from the top five leagues since 1980 and simulates a European
        night instead of a World Cup. World Cup boards and club boards do not share picks.
      </p>
      <p>
        <a className="underline" href="/club">
          Open club draft
        </a>
        .
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">Friends — World Cup</h2>
      <p>
        Local is pass-and-play on one device. Cup Final is a two-seat knockout. Full Cup draws a bracket and fills empty seats with real nations. Only a match between two friends is played in full. A draw goes to penalties, one kick at a time. Set names in the lobby. Online rooms use a code.
      </p>
      <p>
        <a className="underline" href="/friends">
          World Cup friends
        </a>
        .
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">Friends — Clubs and UCL</h2>
      <p>
        Club friends is a separate lobby. It never shares a room or a player pool with World Cup friends. Friend vs
        friend is two club XIs on one device, then one European night. Rivalry is online 1v1. UCL is a knockout of 4,
        8, 16, or 32 — empty seats become other European clubs, then the live path from the Round of 32 to the Final.
      </p>
      <p>
        <a className="underline" href="/club/friends">
          Club friends
        </a>
        .
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">FAQ</h2>
      <h3 className="font-semibold">Is this an official FIFA game?</h3>
      <p>No. It is an independent draft toy. Not affiliated with FIFA, UEFA, or any club.</p>
      <h3 className="font-semibold">Do I need an account?</h3>
      <p>No. Progress stays on your device. Friends only needs a display name.</p>
      <h3 className="font-semibold">Can I keep the same team and change the year?</h3>
      <p>Yes. After a roll, Another team draws a new side. Another cup keeps that side and changes the year. Clubs use Another club and Another season. Each one spends a re-roll.</p>
    </LegalShell>
  );
}
