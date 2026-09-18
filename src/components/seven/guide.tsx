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

const WORLD_FAQ = [
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

const CLUB_FAQ = [
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
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-5 pb-10 pt-8">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">Game guide</p>
        <h2 className="home-headline mt-2">
          {pool === "club" ? "What is Club mode?" : "What is Seven Nil?"}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-muted">
          {pool === "club"
            ? "A club draft you can finish in a coffee. Roll a side from the top five leagues and a season since 1980, pick one footballer who actually wore that shirt, and keep going until the formation is full. Then see if the XI can live through Europe."
            : "A World Cup draft you can finish in a coffee. Roll a national team and a year, pick one real player who actually wore that shirt, and keep going until the formation is full. Then see if the XI can live through a tournament — or even the dream: champions, unbeaten, nothing conceded."}
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

      <div className="grid gap-10 md:grid-cols-2">
        <article className="flex flex-col gap-3">
          <h3 className="font-display text-2xl leading-none">Rules</h3>
          <p className="text-sm leading-relaxed text-muted">
            One draw, one squad, one player. The formation owns the board. Classic mode shows
            ratings; Almanac hides them. Three rerolls exist for when a squad cannot solve the slot
            you actually need. Spend one on a new nation, or keep the same team and take another
            year.
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

      <div className="flex flex-col gap-6">
        <h3 className="font-display text-2xl leading-none">Common questions</h3>
        <div className="grid gap-6 md:grid-cols-2">
          {faq.map((item) => (
            <article key={item.q} className="flex flex-col gap-2">
              <h4 className="text-sm font-extrabold text-ink">{item.q}</h4>
              <p className="text-sm leading-relaxed text-muted">{item.a}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
