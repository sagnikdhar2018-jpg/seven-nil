const WORLD_STEPS = [
  {
    n: "01",
    title: "Roll a World Cup squad",
    body: "Each turn draws one nation and one tournament year. That squad is your market. You do not search the archive. You react to what the dice give you.",
  },
  {
    n: "02",
    title: "Take one footballer",
    body: "Only names that fit an open role can join the XI. A famous ten is useless if you still need a left-back. One pick, then the squad is gone.",
  },
  {
    n: "03",
    title: "Simulate the campaign",
    body: "When eleven slots are filled, the run is judged: group games, knockouts, and whether the spine holds. Balance beats a highlight reel.",
  },
];

const CLUB_STEPS = [
  {
    n: "01",
    title: "Roll a club season",
    body: "Each turn draws one club from the top five leagues and a year from 1980 on. Liverpool 84, Milan 89, Barcelona 09 — you take what the dice give.",
  },
  {
    n: "02",
    title: "Take one footballer",
    body: "Same rule as the World Cup draft. The shirt has to fit an open role. One pick, then that season is gone.",
  },
  {
    n: "03",
    title: "Simulate Europe",
    body: "The finished XI is thrown into a European campaign: a league phase, then knockouts, then a final. The seven-nil still means champions, unbeaten, nothing conceded.",
  },
];

export const WORLD_FAQ = [
  {
    q: "What is Seven Nil?",
    a: "A free World Cup draft. Each turn draws one national team and one tournament year. You pick a player who fits an open role, complete an XI, then simulate the campaign.",
  },
  {
    q: "Classic or Almanac?",
    a: "Classic shows ratings so every pick has clear information. Almanac hides the numbers and turns the draft into a memory test.",
  },
  {
    q: "Why is it harder than it looks?",
    a: "Famous names tempt you. The formation decides what you actually need. A weak keeper or an empty midfield can sink a glamorous attack.",
  },
  {
    q: "What is a dream finish?",
    a: "Champions, unbeaten, nothing conceded. That is the seven-nil — the run the game is named for.",
  },
];

export const CLUB_FAQ = [
  {
    q: "What is Club mode?",
    a: "A separate draft from the World Cup game. You roll historic club sides from England, Spain, Italy, Germany, and France, from 1980 to now.",
  },
  {
    q: "Which leagues?",
    a: "The top five: First Division / Premier League, La Liga, Serie A, Bundesliga, and Division 1 / Ligue 1. Famous European nights only, no filler squads.",
  },
  {
    q: "Is the pool mixed with countries?",
    a: "No. Club mode never draws a national team. World Cup mode never draws a club. They are two games.",
  },
  {
    q: "Can I play club drafts with friends?",
    a: "Yes. Club friends is a separate lobby: friend vs friend on one device, a Rivalry 1v1 online, or a UCL knockout of 4 to 32. Those rooms never mix with World Cup friends.",
  },
  {
    q: "What does the simulation judge?",
    a: "A European campaign against other clubs. Same dream: champions, unbeaten, nothing conceded.",
  },
];

export function Guide({ pool = "world" }: { pool?: "world" | "club" }) {
  const steps = pool === "club" ? CLUB_STEPS : WORLD_STEPS;
  const faq = pool === "club" ? CLUB_FAQ : WORLD_FAQ;
  return (
    <section className="below-fold mx-auto flex w-full max-w-5xl flex-col gap-16 px-5 pb-10 pt-8">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">Game guide</p>
        <h2 className="home-headline mt-2">
          {pool === "club" ? "What is Club mode?" : "What is Seven Nil?"}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-muted" id="answer">
          {pool === "club"
            ? "Club mode in Seven Nil is a separate draft. You roll one club from the top five leagues and one season since 1980, take one footballer who wore that shirt, and simulate a European run."
            : "Seven Nil is a free World Cup draft you play in the browser. Each turn gives you one national team and one tournament year. You take one player who fits an open role, fill eleven shirts, and simulate the cup."}
        </p>
        <p className="text-xs font-semibold text-muted">Last updated: September 2026</p>
        <nav aria-label="On this page" className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm font-extrabold">
          <a href="#how-a-turn-works">How a turn works</a>
          <a href="#ratings">Ratings</a>
          <a href="#questions">Questions</a>
          <a href="#record">Numbers</a>
          <a href="#sources">Sources</a>
        </nav>
      </div>

      <div id="how-a-turn-works" className="flex flex-col gap-8">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl leading-none">How does a turn work?</h2>
          <p className="mt-3 text-base leading-relaxed text-muted">
            A turn is one roll and one pick. The dice give you a single squad. You take the one footballer who fits an
            empty role, then that squad is gone. Eleven turns fill the XI.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
        {steps.map((step) => (
          <article key={step.n} className="flex flex-col gap-3">
            <p className="font-numeral text-sm font-extrabold text-accent">{step.n}</p>
            <h3 className="font-display text-2xl leading-none">{step.title}</h3>
            <p className="text-sm leading-relaxed text-muted">{step.body}</p>
          </article>
        ))}
        </div>
      </div>

      <div id="ratings" className="flex flex-col gap-6">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl leading-none">What do the ratings mean?</h2>
          <p className="mt-3 text-base leading-relaxed text-muted">
            A rating is that year only, on a scale from the low 70s to the mid-90s. Classic shows the number. Almanac
            hides it. A name above 90 is gold. You have five redraws, and names lock when the draft starts.
          </p>
        </div>
        <div className="grid gap-10 md:grid-cols-2">
        <article className="flex flex-col gap-3">
          <h3 className="font-display text-2xl leading-none">Rules</h3>
          <p className="text-sm leading-relaxed text-muted">
            One draw, one squad, one player. The formation owns the board. Classic mode shows
            ratings; Almanac hides them. Five chances cover a bad draw. Another team and another
            cup each spend one. Another cup keeps the side and changes the year. Names are set before the draft starts.
          </p>
        </article>
        <article className="flex flex-col gap-3">
          <h3 className="font-display text-2xl leading-none">Build the spine first</h3>
          <p className="text-sm leading-relaxed text-muted">
            Keepers, centre-backs, full-backs, and central midfield win campaigns. Attackers are
            cheap in the draw. Rare defenders are not. Take the scarce role, then let nostalgia in.
          </p>
        </article>
        </div>
      </div>

      <div id="questions" className="flex flex-col gap-6">
        <h2 className="font-display text-3xl leading-none">Common questions</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {faq.map((item) => (
            <article key={item.q} className="flex flex-col gap-2">
              <h3 className="text-sm font-extrabold text-ink">{item.q}</h3>
              <p className="text-sm leading-relaxed text-muted">{item.a}</p>
            </article>
          ))}
        </div>
      </div>

      <div id="record" className="flex max-w-2xl flex-col gap-3 text-sm leading-relaxed text-muted">
        <h2 className="font-display text-3xl leading-none text-ink">The numbers the draft uses</h2>
        <p>
          TL;DR: Seven Nil rates the season on the card, then simulates from that XI.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>53 national tournament squads, from 1958 through 2026.</li>
          <li>73 club seasons from the top five leagues, starting in 1980.</li>
          <li>1,520 player ratings. A score above 90 is written in gold.</li>
          <li>Five redraws. Another cup and another team each spend one.</li>
          <li>11 players. One open role, one pick.</li>
        </ul>
        <p>
          According to FIFA, the men's{" "}
          <a className="underline" href="https://en.wikipedia.org/wiki/FIFA_World_Cup">
            World Cup
          </a>{" "}
          began in 1930 in Uruguay with 13 teams. The{" "}
          <a className="underline" href="https://en.wikipedia.org/wiki/2022_FIFA_World_Cup">
            2022 tournament
          </a>{" "}
          used 32 teams and 64 matches. The{" "}
          <a className="underline" href="https://en.wikipedia.org/wiki/2026_FIFA_World_Cup">
            2026 tournament
          </a>
          , shared by Canada, Mexico, and the United States, expanded to 48 teams and 104 matches. Those figures are
          the real cups. Seven Nil borrows the bracket shape, not the licence.
        </p>
        <p>
          A rating here is not a career badge. Pelé in 1970 and a quiet year for a famous name are different numbers.
          The match model then uses the XI: overall, attack, midfield, defence, and how well the shirts fit together.
          A stronger side wins more often. It does not win every time.
        </p>
        <blockquote className="border-l-4 border-ink pl-3 text-ink">
          Take the scarce role first. Attackers are common in the draw. A real left-back is not.
        </blockquote>
        <blockquote className="border-l-4 border-ink pl-3 text-ink">
          Only a match between two people is played minute by minute. The rest of the bracket is settled at once.
        </blockquote>
        <figure className="mt-2">
          <img
            src="/og.jpg"
            alt="Seven Nil share image: a green pitch and the 7-0 mark."
            width="1200"
            height="630"
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            className="h-auto w-full max-w-md rounded-lg"
          />
          <figcaption>The board you draft on.</figcaption>
        </figure>
      </div>

      <div id="sources" className="flex max-w-2xl flex-col gap-3 text-sm leading-relaxed text-muted">
        <h2 className="font-display text-3xl leading-none text-ink">What the board is built from</h2>
        <p>
          Seven Nil keeps 53 national tournament squads and 73 club seasons. That is 1,520 player ratings. A rating is
          that year only. Above 90, the name is gold. A quiet tournament does not keep a career score.
        </p>
        <blockquote className="border-l-4 border-ink pl-3 text-ink">
          Champions, unbeaten, and nothing conceded. That is the seven-nil.
        </blockquote>
        <table className="w-full border-collapse text-left text-ink">
          <caption className="sr-only">Seven Nil modes</caption>
          <thead>
            <tr>
              <th className="border-b border-line py-2 pr-3">Mode</th>
              <th className="border-b border-line py-2">What you draft</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border-b border-line py-2 pr-3 font-extrabold">World Cup</td>
              <td className="border-b border-line py-2">One nation, one tournament year</td>
            </tr>
            <tr>
              <td className="border-b border-line py-2 pr-3 font-extrabold">Clubs</td>
              <td className="border-b border-line py-2">One top-five club, one season from 1980</td>
            </tr>
            <tr>
              <td className="py-2 pr-3 font-extrabold">Friends</td>
              <td className="py-2">A final, or a cup seeded by ranking</td>
            </tr>
          </tbody>
        </table>
        <ul className="list-disc space-y-1 pl-5">
          <li>Five redraws. Another cup and another team each spend one.</li>
          <li>World Cup rooms and club rooms never share a player.</li>
          <li>Only a match between two people is played minute by minute.</li>
        </ul>
        <p>
          The real competitions this game borrows its shape from are the{" "}
          <a className="underline" href="https://en.wikipedia.org/wiki/FIFA_World_Cup">
            FIFA World Cup
          </a>{" "}
          (played since 1930) and the{" "}
          <a className="underline" href="https://en.wikipedia.org/wiki/UEFA_Champions_League">
            UEFA Champions League
          </a>
          . Seven Nil is not those competitions and is not licensed by them. Squad notes also follow public tournament
          reports such as the{" "}
          <a className="underline" href="https://en.wikipedia.org/wiki/1970_FIFA_World_Cup">
            1970 World Cup
          </a>{" "}
          and the{" "}
          <a className="underline" href="https://en.wikipedia.org/wiki/2022_FIFA_World_Cup">
            2022 World Cup
          </a>
          .
        </p>
      </div>
    </section>
  );
}
