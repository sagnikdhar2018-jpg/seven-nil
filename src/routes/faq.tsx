import { createFileRoute } from "@tanstack/react-router";
import { LegalShell } from "@/components/seven/legal-shell";
import { faqSchema, pageHead } from "@/lib/seven/site";

const questions = [
  {
    q: "Is Seven Nil an official World Cup or Champions League game?",
    a: "No. It is an independent browser draft. It is not affiliated with FIFA, UEFA, or any club. Names and years identify real squads. The ratings and the simulated scores are written for this game.",
  },
  {
    q: "Why can I not search for a player and take him?",
    a: "A turn offers one squad. You take one player who fits an open role, then that squad leaves. Five redraws cover the draft. Another year of the same side spends one. A different side spends one.",
  },
  {
    q: "Why is a second version of the same player grey?",
    a: "Once a footballer is taken, every other year of that person is marked and cannot be selected. The line under the card says so. The rule is the person, not the shirt number.",
  },
  {
    q: "What happens when the pick timer runs out?",
    a: "The game selects a legal player for the open role. It will not place a forward in a full-back slot just because the number is higher.",
  },
  {
    q: "When can I change my name?",
    a: "Before the draft starts. In a friends room the name is confirmed before you enter. After the first pick, the display name stays locked.",
  },
  {
    q: "What does a gold name mean?",
    a: "A rating above 90 is drawn in gold. That is 91 and higher. Gold is a display rule for this game, not an official award and not a FIFA or EA number.",
  },
  {
    q: "Does the manager change the ratings?",
    a: "No. The manager is offered at the end, with three chances to change them, and does not take an outfield slot. The effect is link-up between players who already share something. Eleven strangers stay a low-chemistry side.",
  },
  {
    q: "Can other players see my XI?",
    a: "In a normal friends match, the other human sees the match you play together. In an organised tournament the host and a partner the host appoints can watch. Other players cannot open your draft. The host can kick a seat. The cup starts only when every playing seat is ready and the host starts it.",
  },
  {
    q: "Why did a bracket show a later round before I had played?",
    a: "It should not. Later rounds stay closed until the live tie is finished. Ties that are not your live match are settled at once so a 32-team cup does not take an hour. A friends match between two people is the one that is played minute by minute, including penalties one kick at a time if it is level.",
  },
  {
    q: "Are the ads proof that Google approved the site?",
    a: "No. The site loads one AdSense script. Google decides whether an ad is served. A script on the page is not an approval, and an empty page is not a rejection you can read from the outside. The cookie policy explains what that script can store.",
  },
];

export const Route = createFileRoute("/faq")({
  component: FaqPage,
  head: () =>
    pageHead({
      title: "Seven Nil FAQ — draft rules, rooms, and ratings",
      description:
        "Answers for the Seven Nil draft: redraws, greyed players, the timer, gold names, friends rooms, and what the ratings are not.",
      path: "/faq",
      schemas: [faqSchema(questions)],
    }),
});

function FaqPage() {
  return (
    <LegalShell title="Common questions" kicker="The rules people hit first">
      <p>
        These answers match the game as it runs. They are not a second rulebook and they are not official competition
        law. If a button does something else, the useful note is the mode, the room code, and what you pressed, sent
        from the <a className="underline" href="/contact">contact page</a>.
      </p>
      {questions.map((item) => (
        <section key={item.q}>
          <h2 className="mt-4 font-display text-2xl tracking-wide">{item.q}</h2>
          <p>{item.a}</p>
        </section>
      ))}
      <h2 className="mt-4 font-display text-2xl tracking-wide">One draft, written out</h2>
      <p>
        Formation 4-3-3. First roll is a famous attack. If the striker roles are the ones still empty, take the
        forward. If a full-back is empty, take the full-back and leave the second forward. Second roll is a defensive
        side. There is no hidden gold name on that card. Take the goalkeeper if the goal is empty. If the goal is
        filled, spend a redraw. Another year stays on that country. Another team leaves it. Both spend one of five.
      </p>
      <p>
        After eleven shirts the coach appears. Three changes. The coach does not fill a hole you left in the back
        line. If the timer on a pick reaches zero, the auto-pick uses a legal role. A name you meant to type has to
        be in the box before the first roll. After that the name is locked, in solo and in a room.
      </p>
      <p>
        A friends cup does not fill in the final before you have played. Your live tie is the one that runs minute by
        minute. The other ties in that round can finish at once, under team names, so you are not waiting on a
        computer opponent's animation. A draw in the live tie goes to penalties, one kick at a time, with who scored
        and who missed shown in order.
      </p>
      <p>
        Step by step play is on <a className="underline" href="/how-to-play">How to play</a>. The rating scale is on{" "}
        <a className="underline" href="/ratings">How a rating is set</a>. What was taken from the public record, and
        what this game invented, is on <a className="underline" href="/sources">Sources</a>. Cookies and the AdSense
        script are on <a className="underline" href="/cookies">Cookies</a>.
      </p>
    </LegalShell>
  );
}
