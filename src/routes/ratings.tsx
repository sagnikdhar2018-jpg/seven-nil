import { createFileRoute } from "@tanstack/react-router";
import { LegalShell } from "@/components/seven/legal-shell";
import { SITE_URL, pageHead } from "@/lib/seven/site";

export const Route = createFileRoute("/ratings")({
  component: RatingsPage,
  head: () =>
    pageHead({
      title: "How Seven Nil ratings work — season scores, not career peaks",
      description:
        "Seven Nil rates a player for one tournament or one league season. Gold names are 91 and above. Chemistry and the manager sit on top of those numbers.",
      path: "/ratings",
      schemas: [
        {
          "@type": "Article",
          headline: "How a Seven Nil rating is set",
          datePublished: "2026-10-01",
          dateModified: "2026-10-01",
          author: { "@id": `${SITE_URL}/#maker` },
          publisher: { "@id": `${SITE_URL}/#org` },
          mainEntityOfPage: `${SITE_URL}/ratings`,
        },
      ],
    }),
});

function RatingsPage() {
  return (
    <LegalShell title="How a rating is set" kicker="That year, not the career">
      <p>
        Every number in Seven Nil is a season score. It describes one World Cup, one European Championship, or one
        league year. It is not a lifetime badge. Pelé in 1970 and a famous forward in a tournament where he barely
        played are different cards, even if you would rank those two players the same way over a decade.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">The scale</h2>
      <p>
        The useful range sits in the low 70s for a squad player or a poor year, the low 80s for a reliable starter,
        the high 80s for a side's best footballer, and the mid-90s for a defining tournament. A 97 is rare. It is
        reserved for a summer or a season that still organises how people talk about that team: Pelé in 1970, Maradona
        in 1986, Messi in 2022, Ronaldo at the 2002 World Cup.
      </p>
      <p>
        Names at 91 and above are written in gold on the card. Gold is a display rule, not a separate statistic. It
        exists so a true standout is obvious when the dice land, and so a famous name in a quiet year is not painted
        gold out of habit.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">What the number is allowed to use</h2>
      <p>
        The rating looks at that competition. Minutes, goals, the role they actually played, and whether the side
        depended on them. A goalkeeper who kept a champion defence organised can outrank a forward who scored in a
        group game and then disappeared. A young player who was in the squad but not the team stays in the 70s. The
        2004 Cristiano Ronaldo card is a winger Portugal could bring on, not the later Real Madrid forward.
      </p>
      <p>
        Shirt numbers follow the tournament or the season where a number is well known. If two players in the same
        squad were both given the same number in the source list, the game keeps both names and moves the duplicate
        number so the cards stay distinct. The name is the record. The number is a label.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">Positions</h2>
      <p>
        A player can have more than one position. Carlos Alberto in 1970 is a right-back. Beckenbauer in 1974 can
        defend or sit in front of the defence. Messi in 2022 can play as a ten, a wide forward, or a striker. The
        draft only lets you take a player into an open role they can actually fill. You cannot park a pure striker at
        left-back because the attack is already full.
      </p>
      <p>
        Fit matters in the match. A player in their best role contributes more than the same player shoved into a
        shirt they only sometimes wore. That is why the formation is chosen before the dice, and why changing
        formation moves people toward the roles they can play instead of leaving the picture frozen.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">Chemistry</h2>
      <p>
        Chemistry is not a second overall. It asks whether the eleven can play as one side. Players from the same
        nation and the same year already know the shirt. Neighbours in the formation add a little more if their roles
        actually connect: a full-back and a winger, a holder and a centre-back, two forwards who occupied the same
        attack.
      </p>
      <p>
        A random all-star eleven can have a huge overall and poor chemistry, because the cards never shared a team.
        A narrower draft, built from two or three great seasons, often links better. The match model uses both. Raw
        quality still matters. A linked side of 74s does not walk through a linked side of 90s.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">The manager</h2>
      <p>
        The manager is the twelfth decision, offered at the end of the draft. You get three chances to change them.
        They do not take a outfield slot. Their effect is link-up: possession and compactness become a chemistry lift,
        and a smaller bump to how the midfield feeds attack and defence.
      </p>
      <p>
        A high link-up coach helps a side that already has some bonds. They do not invent bonds that are not there.
        Pep Guardiola on eleven strangers raises the ceiling a little. The same coach on a side that already shares
        years and roles raises it more. The lineup box shows the chemistry number and the manager's link-up so
        you can see the lift before you simulate.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">What the match then does</h2>
      <p>
        Attack, midfield, and defence are averages of the players in those bands, adjusted for role fit. The
        goalkeeper is separate. Style changes the weighting: a defensive side protects the back, an attacking side
        spends more of its quality up front, a press asks more of the midfield. The result is a chance, not a script.
        Two equal sides can split a tie. A much stronger side loses sometimes, and should.
      </p>
      <p>
        Ratings are not betting odds and not a forecast of a real fixture. If you think a card is wrong, the useful
        correction is the year and what that player did in it. Write it on the{" "}
        <a className="underline" href="/contact">
          contact page
        </a>
        . The rest of the archive is described in the{" "}
        <a className="underline" href="/guides">guides</a>, the{" "}
        <a className="underline" href="/world-cups">World Cup notes</a>, and the{" "}
        <a className="underline" href="/club-seasons">club seasons</a>.
      </p>
    </LegalShell>
  );
}
